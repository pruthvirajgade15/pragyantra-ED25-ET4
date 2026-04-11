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
    """Uses Gemini to predict win probability and competition level along with match score"""
    if not GEMINI_API_KEY:
        return {}

    # Truncate lists to avoid hitting context limits or token limits for huge DBs (Hackathon purpose: top 15)
    schol_list = "\n".join([
        f"ID:{s.id} | Name: {s.name} | Category:{s.category} | State:{s.state} | Field:{s.field} | Amount:{s.amount}"
        for s in scholarships[:50]
    ])

    prompt = f"""You are a scholarship prediction engine.
    
Student Profile:
- Category: {profile.category}
- Income: ₹{profile.annual_income}
- Academic %: {profile.percentage}%
- State: {profile.state}
- Field: {profile.field_of_study}

Scholarships:
{schol_list}

For each ID, provide an analysis in JSON format precisely like this:
{{
  "ID_NUMBER": {{
    "match_score": 92.5,
    "win_probability": 85.0,
    "competition_level": "High" (or Medium, Low),
    "amount_rank": 9.5 (scale of 1-10)
  }}
}}
Make the analysis realistic based on Indian Scholarship trends. No explanations. Return strictly valid JSON."""

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
    """Returns AI-ranked scholarships prioritizing Win probability and amount"""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not completed")

    scholarships = db.query(Scholarship).filter(Scholarship.is_active == True).all()
    
    # Run through Rule Based first to filter
    filtered_scholarships = []
    for s in scholarships:
        base_score = rule_based_score(profile, s)
        if base_score > 20: # Keep decently matching ones
            filtered_scholarships.append((s, base_score))
            
    filtered_scholarships.sort(key=lambda x: x[1], reverse=True)
    top_candidates = [s[0] for s in filtered_scholarships[:50]]
    
    # Try getting enhanced predictions from Gemini
    ai_predictions = await get_enhanced_ai_predictions(profile, top_candidates)
    
    now = datetime.utcnow()
    results = []
    
    for s in top_candidates:
        pred = ai_predictions.get(str(s.id), {})
        
        # Fallback to intelligent heuristics if AI fails
        match_score = pred.get("match_score", rule_based_score(profile, s))
        win_probability = pred.get("win_probability", None)
        competition_level = pred.get("competition_level", "Medium")
        amount_rank = pred.get("amount_rank", 5.0)
        
        if not win_probability:
            # Heuristic calculation for win probability
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
