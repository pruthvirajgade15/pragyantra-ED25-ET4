"""
Essay Generator Router
AI-powered scholarship essay generation in Hindi & English using Gemini AI
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os, httpx

from database.db import get_db, EssayDraft, StudentProfile, Scholarship, User
from routers.auth import get_current_user

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# ── Schemas ───────────────────────────────────────────────────────────────────

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


# ── Core Generator ────────────────────────────────────────────────────────────

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

    profile_context = f"""
Student Profile:
- Name: {profile.full_name}
- Category: {profile.category}
- Annual Family Income: ₹{profile.annual_income:,.0f}
- Academic Performance: {profile.percentage}%
- State: {profile.state}
- Field of Study: {profile.field_of_study}
- College: {profile.college}
- Current Year: {profile.current_year}
""" if profile else ""

    extra_context = ""
    if personal_story: extra_context += f"\nPersonal Story/Background: {personal_story}"
    if goals:          extra_context += f"\nCareer Goals: {goals}"
    if achievements:   extra_context += f"\nAchievements: {achievements}"

    prompt = f"""You are an expert scholarship application essay writer for Indian students.

{lang_instruction}

Generate a compelling scholarship application essay for:
Scholarship: {scholarship_name}
Target word count: ~{word_count} words

{profile_context}
{extra_context}

Requirements:
1. Start with a powerful hook about the student's background/challenges
2. Explain financial need and how it has shaped the student
3. Describe academic achievements and extracurriculars
4. Connect goals to this specific scholarship's mission
5. End with a strong, memorable conclusion
6. Be authentic, emotional, and specific — NOT generic
7. {"Use Devanagari script throughout" if language == "hi" else "Use American/Indian English"}

Write only the essay, no titles or explanations."""

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
    """Fallback essay when API key not configured"""
    if language == "hi":
        return f"""मेरा नाम [आपका नाम] है और मैं [राज्य] से हूँ। मेरे परिवार की वार्षिक आय बहुत कम है, 
फिर भी मैंने अपनी पढ़ाई में [प्रतिशत]% अंक प्राप्त किए हैं। 

{scholarship_name} छात्रवृत्ति मेरे सपनों को साकार करने में महत्वपूर्ण भूमिका निभाएगी। 
मैं [क्षेत्र] में अपना करियर बनाना चाहता/चाहती हूँ और समाज की सेवा करना चाहता/चाहती हूँ।

आर्थिक तंगी के बावजूद, मैंने कभी हार नहीं मानी। यह छात्रवृत्ति मुझे अपने लक्ष्य तक पहुँचने में मदद करेगी।
मैं वादा करता/करती हूँ कि इस अवसर का सदुपयोग करूँगा/करूँगी।"""
    else:
        return f"""Growing up in a low-income family has taught me the true value of education. 
Despite financial challenges, I have maintained {80}% in my academics and remain committed to 
achieving my goals in my field of study.

The {scholarship_name} represents more than financial aid to me — it is a vote of confidence 
in students like me who dare to dream beyond their circumstances. 

I am determined to use this opportunity to not only advance my own career but to give back 
to my community. This scholarship will be a turning point in my educational journey.

Thank you for considering my application. I promise to honor this investment with dedication 
and hard work."""


# ── Endpoints ─────────────────────────────────────────────────────────────────

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

    # Save draft to DB
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
