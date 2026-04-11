import os
import httpx
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict

from database.db import get_db, Scholarship, StudentProfile, User
from routers.auth import get_current_user
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Models to try in order (fallback chain — put working model first)
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
]

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

@router.post("/ask")
async def ask_chatbot(
    req: ChatRequest,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key missing")
        
    # Get user profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    
    # Get scholarships
    scholarships = db.query(Scholarship).filter(Scholarship.is_active == True).all()
    
    # Format DB context
    schol_context = "\n".join([
        f"- {s.name}: {s.amount}, Deadline: {s.deadline.strftime('%d %b %Y') if s.deadline else 'Open'}, Category: {s.category}, Field: {s.field}, Provider: {s.provider}"
        for s in scholarships[:30]
    ])
    
    profile_context = ""
    if profile:
        profile_context = f"""Student Name: {current_user.name}
Category: {profile.category}
Field of Study: {profile.field_of_study}
State: {profile.state}
Annual Income: {profile.annual_income}
Academic Percentage: {profile.percentage}%"""
    else:
        profile_context = f"Student Name: {current_user.name}\nProfile: Not yet completed"

    sys_prompt = f"""You are ScholarshipHunter AI Assistant. Help {current_user.name} with scholarship queries.
Be concise, friendly, and helpful. Use bold (**text**) for key terms.

Student Profile:
{profile_context}

Available Scholarships in Database:
{schol_context}

Rules:
- Only recommend scholarships listed above
- Evaluate eligibility based on the student profile
- Keep answers brief and actionable"""

    # Build payload
    payload = {"contents": []}
    
    # Attach conversation history (skip any empty messages)
    for msg in req.history:
        role = "user" if msg.get("role") == "user" else "model"
        content = msg.get("content", "").strip()
        if content:
            payload["contents"].append({
                "role": role,
                "parts": [{"text": content}]
            })
        
    # Attach current message with context
    user_text = f"""[CONTEXT]
{sys_prompt}

[USER MESSAGE]
{req.message}"""
    
    payload["contents"].append({
        "role": "user",
        "parts": [{"text": user_text}]
    })

    # Try each model in the fallback chain, with retry on rate limit
    last_error = None
    async with httpx.AsyncClient(timeout=60) as client:
        for model_name in GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
            
            # Try up to 2 times per model (retry once after delay)
            for attempt in range(2):
                try:
                    res = await client.post(
                        url,
                        headers={"Content-Type": "application/json"},
                        json=payload
                    )
                    
                    if res.status_code == 200:
                        data = res.json()
                        try:
                            reply = data["candidates"][0]["content"]["parts"][0]["text"]
                            return {"reply": reply}
                        except (KeyError, IndexError):
                            last_error = "Empty response from AI"
                            break  # Move to next model
                    elif res.status_code == 429:
                        if attempt == 0:
                            # Wait and retry this same model once
                            print(f"Rate limited on {model_name}, waiting 5s to retry...")
                            await asyncio.sleep(5)
                            continue
                        else:
                            print(f"Still rate limited on {model_name}, trying next model...")
                            last_error = "Rate limited"
                            break  # Move to next model
                    else:
                        print(f"Error on {model_name}: {res.status_code} - {res.text[:200]}")
                        last_error = f"API error {res.status_code}"
                        break  # Move to next model
                        
                except Exception as e:
                    print(f"Exception on {model_name}: {e}")
                    last_error = str(e)
                    break  # Move to next model
    
    # All models failed — return a helpful message instead of crashing
    return {"reply": f"I'm temporarily unable to connect to the AI service. Your API quota may have been exceeded. Please wait about 30 seconds and try again."}
