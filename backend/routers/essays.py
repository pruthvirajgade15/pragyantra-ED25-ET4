import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database.db import get_db, StudentProfile, EssayDraft, User
from routers.auth import get_current_user
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]

class EssayRequest(BaseModel):
    scholarship_id: Optional[int] = None
    scholarship_name: str
    language: str = "en"
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
    profile: Optional[StudentProfile],
    scholarship_name: str,
    language: str,
    word_count: int,
    personal_story: str,
    goals: str,
    achievements: str,
) -> str:
    lang_instruction = "Write in professional English." if language == "en" else "हिंदी में लिखें (देवनागरी लिपि में)। भाषा सम्मानजनक, औपचारिक और प्रभावशाली होनी चाहिए।"
    
    profile_context = ""
    if profile:
        full_name = getattr(profile, 'full_name', None) or 'Student'
        field_of_study = getattr(profile, 'field_of_study', None) or 'General'
        percentage = getattr(profile, 'percentage', None) or 80
        annual_income = getattr(profile, 'annual_income', None) or '2,50,000'
        state = getattr(profile, 'state', None) or 'India'
        category = getattr(profile, 'category', None) or 'General'
        profile_context = f"""
        Student: {full_name}, Field: {field_of_study},
        Marks: {percentage}%, Family Income: Rs {annual_income}/year,
        State: {state}, Category: {category}.
        """

    extra_context = ""
    if personal_story: extra_context += f"\nPersonal Background / Challenges: {personal_story}"
    if goals: extra_context += f"\nCareer Aspirations: {goals}"
    if achievements: extra_context += f"\nAcademic & Extracurricular Achievements: {achievements}"

    prompt = f"""You are an expert scholarship essay writer and academic advisor.
    Write an inspiring, structured scholarship statement of purpose for the '{scholarship_name}' scholarship.
    Approximate target word count: {word_count} words.
    Student profile details: {profile_context}
    Additional student inputs: {extra_context}
    
    Guidelines:
    - {lang_instruction}
    - Emphasize dedication, financial need, and commitment to contributing back to society.
    - Keep formatting clean with clear paragraphs. Do NOT include markdown headers or greetings like 'Dear Committee'—start directly with the essay text.
    """

    for model_name in GEMINI_MODELS:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                res = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}",
                    headers={"Content-Type": "application/json"},
                    json={"contents": [{"parts": [{"text": prompt}]}]}
                )
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
                else:
                    print(f"Gemini model {model_name} returned status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"Gemini model {model_name} error: {e}")

    # Fallback if all Gemini models fail or quota is exhausted
    return generate_fallback_essay(
        scholarship_name=scholarship_name,
        language=language,
        word_count=word_count,
        profile=profile,
        personal_story=personal_story,
        goals=goals,
        achievements=achievements
    )

def generate_fallback_essay(
    scholarship_name: str,
    language: str,
    word_count: int,
    profile: Optional[StudentProfile] = None,
    personal_story: str = "",
    goals: str = "",
    achievements: str = ""
) -> str:
    name = (profile.full_name if profile and profile.full_name else None) or "a dedicated student"
    field = (profile.field_of_study if profile and profile.field_of_study else None) or "my academic field"
    percentage = profile.percentage if profile and profile.percentage else None
    marks = f"{percentage}%" if percentage else "consistent academic merit"
    
    if language == "hi":
        return f"""मैं यह आवेदन {scholarship_name} के लिए अत्यंत विनम्रता और सम्मान के साथ प्रस्तुत कर रहा हूँ। एक समर्पित छात्र के रूप में, मैंने हमेशा अपनी शिक्षा और व्यक्तिगत विकास को प्राथमिकता दी है।

वर्तमान में मैं {field} में अध्ययनरत हूँ और अपनी पिछली परीक्षाओं में {marks} प्राप्त करने में सफल रहा हूँ। उच्च शिक्षा प्राप्त करने की मेरी यात्रा में वित्तीय चुनौतियाँ एक महत्वपूर्ण बाधा रही हैं, लेकिन इसने ज्ञान प्राप्त करने और अपने लक्ष्यों को प्राप्त करने के मेरे संकल्प को और मजबूत किया है। {personal_story if personal_story else 'पारिवारिक समर्थन और दृढ़ संकल्प के बल पर मैंने हर बाधा को पार करने का प्रयास किया है।'}

{achievements if achievements else 'मेरी शैक्षणिक उपलब्धियों और पाठ्येतर गतिविधियों ने मुझे अनुशासन और नेतृत्व क्षमता सिखाई है।'} यह छात्रवृत्ति मेरे वित्तीय भार को काफी हद तक कम करेगी, जिससे मैं अपनी पढ़ाई पर पूरी तरह से ध्यान केंद्रित कर सकूँगा।

मेरा अंतिम लक्ष्य {goals if goals else 'अपने चुने हुए क्षेत्र में उत्कृष्टता प्राप्त करना और समाज में सकारात्मक योगदान देना'} है। {scholarship_name} मुझे इस लक्ष्य के करीब ले जाने में महत्वपूर्ण भूमिका निभाएगी। इस अवसर पर विचार करने के लिए धन्यवाद।"""
    else:
        return f"""I am writing to formally submit my application for the prestigious {scholarship_name}. As {name} currently pursuing my higher education in {field}, I have consistently strived for academic excellence, maintaining {marks} throughout my coursework.

Education has always been the cornerstone of my aspirations, yet pursuing advanced studies brings substantial financial hurdles. {personal_story if personal_story else 'Navigating limited financial resources while balancing rigorous coursework has strengthened my resilience and reinforced my dedication to academic success.'} Receiving the {scholarship_name} would alleviate this pressing financial constraint, enabling me to focus wholeheartedly on academic excellence, technical projects, and impactful community initiatives.

Throughout my academic journey, {achievements if achievements else 'I have consistently taken the initiative to expand my practical knowledge through projects, academic competitions, and leadership activities.'} These experiences have solidified my belief in using education as a catalyst for meaningful change.

Looking ahead, my ultimate objective is {goals if goals else 'to graduate with distinction and contribute significantly to technological and societal progress'}. With the crucial support of the {scholarship_name}, I am confident that I will overcome economic barriers and realize these ambitions. Thank you for considering my application and for investing in the potential of dedicated scholars."""

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
        essay = generate_fallback_essay(
            scholarship_name=req.scholarship_name,
            language=req.language,
            word_count=req.word_count,
            profile=profile,
            personal_story=req.personal_story or "",
            goals=req.goals or "",
            achievements=req.achievements or ""
        )

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
    drafts = db.query(EssayDraft).filter(EssayDraft.user_id == current_user.id).order_by(EssayDraft.created_at.desc()).all()
    return [{"id": d.id, "title": d.title, "language": d.language,
             "word_count": d.word_count, "created_at": str(d.created_at),
             "preview": d.content[:150] + "..."} for d in drafts]

@router.get("/drafts/{draft_id}")
def get_draft(draft_id: int, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    draft = db.query(EssayDraft).filter(
        EssayDraft.id == draft_id,
        EssayDraft.user_id == current_user.id
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return {
        "id": draft.id,
        "title": draft.title,
        "content": draft.content,
        "language": draft.language,
        "word_count": draft.word_count,
        "created_at": str(draft.created_at),
        "scholarship_id": draft.scholarship_id,
    }

@router.delete("/drafts/{draft_id}")
def delete_draft(draft_id: int, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    draft = db.query(EssayDraft).filter(
        EssayDraft.id == draft_id,
        EssayDraft.user_id == current_user.id
    ).first()
    if draft:
        db.delete(draft)
        db.commit()
    return {"message": "Draft deleted"}