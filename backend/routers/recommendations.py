import os
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import httpx

from database.db import get_db, Scholarship, StudentProfile, User
from routers.auth import get_current_user
from routers.scholarships import rule_based_score

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def get_enhanced_ai_predictions(profile: StudentProfile, scholarships: list) -> dict:
    
    if not GEMINI_API_KEY:
        return {}

    schol_list = "\n".join([
        f"ID:{s.id} | Name: {s.name} | Category:{s.category} | State:{s.state} | Field:{s.field} | Amount:{s.amount}"
        for s in scholarships[:50]
    ])

    prompt = f"""
    Analyze these scholarships for a student profile:
    {profile.__dict__}
    
    Scholarships:
    {schol_list}
    
    Return a JSON object where keys are scholarship IDs (as strings), and values are objects with:
    - match_score (float 0-100)
    - win_probability (float 0-100)
    - competition_level (string "Low", "Medium", "High")
    - amount_rank (float 1-10)
    
    Output ONLY valid JSON without any markdown formatting.
    """
    try:
        async with httpx.AsyncClient(timeout=45) as client:
            res = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            data = res.json()
            if res.status_code == 200:
                import json, re
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    return json.loads(match.group())
    except Exception as e:
        print(f"Prediction engine error: {e}")
        
    return {}

@router.get("/prioritize")
async def get_prioritized_recommendations(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not completed")

    scholarships = db.query(Scholarship).filter(Scholarship.is_active == True).all()
    
    filtered_scholarships = []
    for s in scholarships:
        base_score = rule_based_score(profile, s)
        if base_score > 20:
            filtered_scholarships.append((s, base_score))
            
    filtered_scholarships.sort(key=lambda x: x[1], reverse=True)
    top_candidates = [s[0] for s in filtered_scholarships[:50]]
    
    ai_predictions = await get_enhanced_ai_predictions(profile, top_candidates)
    
    now = datetime.utcnow()
    results = []
    
    for s in top_candidates:
        pred = ai_predictions.get(str(s.id), {})
        
        match_score = pred.get("match_score", rule_based_score(profile, s))
        win_probability = pred.get("win_probability", None)
        competition_level = pred.get("competition_level", "Medium")
        amount_rank = pred.get("amount_rank", 5.0)
        
        if not win_probability:
            win_probability = min(match_score * 0.9, 95.0)
            if "NSP" in s.provider or "National" in s.name:
                competition_level = "High"
                win_probability -= 15
            elif s.state != "All India" and profile.state == s.state:
                competition_level = "Low"
                win_probability += 10
            elif "Buddy4Study" in s.provider or "Private" in s.provider:
                competition_level = "Medium"
        
        days_left = (s.deadline - now).days if s.deadline else None
        
        results.append({
            "id": s.id,
            "name": s.name,
            "provider": s.provider,
            "amount": s.amount,
            "match_score": round(match_score, 1),
            "win_probability": round(win_probability, 1),
            "competition_level": competition_level,
            "days_left": days_left,
            "official_link": s.official_link,
            "priority_score": round((win_probability * 0.6) + (amount_rank * 10 * 0.4), 1)  # Hybrid rank logic
        })
        
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    return results