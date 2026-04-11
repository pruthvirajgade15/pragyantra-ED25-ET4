

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os, httpx

from database.db import get_db, EssayDraft, StudentProfile, Scholarship, User
from routers.auth import get_current_user

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class EssayRequest(BaseModel):
    scholarship_id: Optional[int] = None
    scholarship_name: str
    language: str = "en"           # "en" or "hi"
    word_count: int = 300
    personal_story: Optional[str] = None
    goals: Optional[str] = None
    achievements: Optional[str] = None

class EssayResponse(BaseModel):
    essay: str
    word_count: int
    language: str
    scholarship_name: str
    draft_id: Optional[int] = None

async def generate_essay_with_gemini(
    profile: StudentProfile,
    scholarship_name: str,
    language: str,
    word_count: int,
    personal_story: str = "",
    goals: str = "",
    achievements: str = "",
) -> str:

    lang_instruction = (
        "Write entirely in Hindi (Devanagari script). Use simple, clear Hindi."
        if language == "hi" else
        "Write entirely in English. Use clear, professional, heartfelt language."
    )

    profile_context = f"{profile.__dict__}" if profile else ""

    extra_context = ""
    if personal_story: extra_context += f"\nPersonal Story/Background: {personal_story}"
    if goals:          extra_context += f"\nCareer Goals: {goals}"
    if achievements:   extra_context += f"\nAchievements: {achievements}"

    prompt = f"""You are an expert scholarship essay writer.
    Write an essay for the '{scholarship_name}' scholarship.
    Approximate word count: {word_count}.
    Student profile contexts: {profile_context}
    Additional contexts: {extra_context}
    
    Instructions:
    {lang_instruction}
    """

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            data = res.json()
            
            if res.status_code != 200:
                error_msg = data.get("error", {}).get("message", "Unknown API Error")
                raise Exception(f"Gemini API Error ({res.status_code}): {error_msg}")
                
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

def generate_fallback_essay(scholarship_name: str, language: str, word_count: int) -> str:
    
    if language == "hi":
        return f"यह {scholarship_name} के लिए एक निबंध है। (This is an AI generated fallback essay.)"
    else:
        return f"This is an essay for the {scholarship_name} scholarship. (This is an AI generated fallback essay.)"

@router.post("/generate", response_model=EssayResponse)
async def generate_essay(
    req: EssayRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()

    if GEMINI_API_KEY:
        essay = await generate_essay_with_gemini(
            profile=profile,
            scholarship_name=req.scholarship_name,
            language=req.language,
            word_count=req.word_count,
            personal_story=req.personal_story or "",
            goals=req.goals or "",
            achievements=req.achievements or "",
        )
    else:
        essay = generate_fallback_essay(req.scholarship_name, req.language, req.word_count)

    draft = EssayDraft(
        user_id=current_user.id,
        scholarship_id=req.scholarship_id,
        title=f"Essay for {req.scholarship_name}",
        content=essay,
        language=req.language,
        word_count=len(essay.split()),
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)

    return EssayResponse(
        essay=essay,
        word_count=len(essay.split()),
        language=req.language,
        scholarship_name=req.scholarship_name,
        draft_id=draft.id,
    )

@router.get("/drafts")
def get_drafts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    drafts = db.query(EssayDraft).filter(EssayDraft.user_id == current_user.id).all()
    return [{"id": d.id, "title": d.title, "language": d.language,
             "word_count": d.word_count, "created_at": str(d.created_at),
             "preview": d.content[:150] + "..."} for d in drafts]

@router.get("/drafts/{draft_id}")
def get_draft(draft_id: int, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    draft = db.query(EssayDraft).filter(
        EssayDraft.id == draft_id, EssayDraft.user_id == current_user.id
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

@router.delete("/drafts/{draft_id}")
def delete_draft(draft_id: int, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    draft = db.query(EssayDraft).filter(
        EssayDraft.id == draft_id, EssayDraft.user_id == current_user.id
    ).first()
    if draft:
        db.delete(draft)
        db.commit()
    return {"message": "Deleted"}