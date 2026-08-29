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

GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
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
        
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    
    scholarships = db.query(Scholarship).filter(Scholarship.is_active == True).all()
    
    schol_context = "\n".join([
        f"- {s.name}: {s.amount}, Deadline: {s.deadline.strftime('%d %b %Y') if s.deadline else 'Open'}, Category: {s.category}, Field: {s.field}, Provider: {s.provider}"
        for s in scholarships[:30]
    ])
    
    profile_context = ""
    if profile:
        profile_context = f"Student Profile:\nName: {current_user.name}\nState: {profile.state}\nField: {profile.field_of_study}\nGender: {profile.gender}\nDisability: {profile.disability}\nMinority: {profile.is_minority}\nIncome: {profile.annual_income}\nPercentage: {profile.percentage}"
    else:
        profile_context = f"Student Name: {current_user.name}\nProfile: Not yet completed"

    sys_prompt = f"You are a helpful AI Scholarship Assistant. The user's profile is:\n{profile_context}\n\nAnd some matching scholarships are:\n{schol_context}\n\nAnswer the user clearly."

    payload = {"contents": []}
    
    for msg in req.history:
        role = "user" if msg.get("role") == "user" else "model"
        content = msg.get("content", "").strip()
        if content:
            payload["contents"].append({
                "role": role,
                "parts": [{"text": content}]
            })
        
    user_text = f"System: {sys_prompt}\nUser: {req.message}"
    
    payload["contents"].append({
        "role": "user",
        "parts": [{"text": user_text}]
    })

    last_error = None
    async with httpx.AsyncClient(timeout=60) as client:
        for model_name in GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
            
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
                            break
                    elif res.status_code == 429:
                        if attempt == 0:
                            print(f"Rate limited on {model_name}, waiting 5s to retry...")
                            await asyncio.sleep(5)
                            continue
                        else:
                            print(f"Still rate limited on {model_name}, trying next model...")
                            last_error = "Rate limited"
                            break
                    else:
                        print(f"Error on {model_name}: {res.status_code} - {res.text[:200]}")
                        last_error = f"API error {res.status_code}"
                        break
                        
                except Exception as e:
                    print(f"Exception on {model_name}: {e}")
                    last_error = str(e)
                    break
    
    return {"reply": f"I'm temporarily unable to connect to the AI service. Your API quota may have been exceeded. Please wait about 30 seconds and try again."}