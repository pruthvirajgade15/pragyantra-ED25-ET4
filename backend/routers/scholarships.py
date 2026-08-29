

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os, httpx

from database.db import get_db, Scholarship, StudentProfile, SavedScholarship, User
from routers.auth import get_current_user

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ScholarshipOut(BaseModel):
    id:           int
    name:         str
    provider:     str
    amount:       str
    deadline:     Optional[datetime]
    eligibility:  str
    category:     str
    state:        str
    field:        str
    official_link: str
    description:  str
    source:       str
    match_score:  Optional[float] = None
    days_left:    Optional[int]   = None

    model_config = {"from_attributes": True}

class SaveRequest(BaseModel):
    scholarship_id: int
    match_score:    float = 0.0

async def get_ai_match_scores(profile: StudentProfile, scholarships: List[Scholarship]) -> dict:
    
    if not GEMINI_API_KEY:
        return {}

    schol_list = "\n".join([
        f"ID:{s.id} | {s.name} | Category:{s.category} | State:{s.state} | "
        f"Field:{s.field} | Income_limit:{s.income_limit} | Min%:{s.min_percentage} | "
        f"Gender:{s.gender} | Disability:{s.disability_required}"
        for s in scholarships[:30]
    ])

    prompt = f"""Review the following scholarships:
    {schol_list}
    For the student profile:
    {profile.__dict__}
    Return a JSON dictionary mapping scholarship ID (as string) to match score (float 0-100). Only return valid JSON without any markdown formatting.
    """

    models = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    for model_name in models:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                res = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}",
                    headers={"Content-Type": "application/json"},
                    json={"contents": [{"parts": [{"text": prompt}]}]}
                )
                data = res.json()
                if res.status_code == 200:
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    import json, re
                    match = re.search(r'\{.*\}', text, re.DOTALL)
                    if match:
                        scores = json.loads(match.group())
                        return {int(k): float(v) for k, v in scores.items()}
        except Exception as e:
            print(f"AI matching error on {model_name}: {e}")
    return {}

def rule_based_score(profile: StudentProfile, s: Scholarship) -> float:
    
    score = 50.0

    if s.category not in ["All", "all"] and s.category != profile.category:
        return 0.0
    elif s.category == profile.category:
        score += 25

    if s.income_limit and profile.annual_income and profile.annual_income > s.income_limit:
        return 0.0
    elif s.income_limit and profile.annual_income:
        score += 15

    if s.min_percentage and profile.percentage and profile.percentage < s.min_percentage:
        return 0.0
    elif s.min_percentage and profile.percentage:
        score += 10

    if s.state not in ["All India", "All", "all"]:
        if profile.state and profile.state.lower() in s.state.lower():
            score += 10

    if s.field not in ["All", "all"]:
        if profile.field_of_study and profile.field_of_study.lower() in s.field.lower():
            score += 10

    if s.gender and s.gender not in ["All", "all"]:
        if profile.gender and s.gender.lower() != profile.gender.lower():
            return 0.0

    if s.disability_required and not profile.disability:
        return 0.0

    return min(score, 100.0)

@router.get("", response_model=List[ScholarshipOut])
@router.get("/", response_model=List[ScholarshipOut])
async def list_scholarships(
    category: Optional[str] = None,
    state:    Optional[str] = None,
    field:    Optional[str] = None,
    search:   Optional[str] = None,
    limit:    int = 50,
    db: Session = Depends(get_db),
):
    q = db.query(Scholarship).filter(Scholarship.is_active == True)
    if category: q = q.filter(or_(Scholarship.category == category, Scholarship.category == "All"))
    if state:    q = q.filter(or_(Scholarship.state == state, Scholarship.state == "All India"))
    if field:    q = q.filter(or_(Scholarship.field.ilike(f"%{field}%"), Scholarship.field == "All"))
    if search:   q = q.filter(or_(Scholarship.name.ilike(f"%{search}%"), Scholarship.provider.ilike(f"%{search}%")))
    scholarships = q.limit(limit).all()

    now = datetime.utcnow()
    result = []
    for s in scholarships:
        days_left = max(0, (s.deadline - now).days) if s.deadline else None
        result.append(ScholarshipOut(
            id=s.id, name=s.name, provider=s.provider, amount=s.amount,
            deadline=s.deadline, eligibility=s.eligibility, category=s.category,
            state=s.state, field=s.field, official_link=s.official_link,
            description=s.description, source=s.source, days_left=days_left
        ))
    return result

@router.get("/matched", response_model=List[ScholarshipOut])
async def matched_scholarships(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found. Please complete your profile first.")

    scholarships = db.query(Scholarship).filter(Scholarship.is_active == True).all()

    ai_scores = await get_ai_match_scores(profile, scholarships)
    now = datetime.utcnow()

    result = []
    for s in scholarships:
        score = ai_scores.get(s.id) if ai_scores else None
        if score is None:
            score = rule_based_score(profile, s)
        if score > 0:
            days_left = (s.deadline - now).days if s.deadline else None
            result.append(ScholarshipOut(
                id=s.id, name=s.name, provider=s.provider, amount=s.amount,
                deadline=s.deadline, eligibility=s.eligibility, category=s.category,
                state=s.state, field=s.field, official_link=s.official_link,
                description=s.description, source=s.source,
                match_score=round(score, 1), days_left=days_left
            ))

    result.sort(key=lambda x: x.match_score or 0, reverse=True)
    return result[:20]

@router.post("/save")
def save_scholarship(req: SaveRequest, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    existing = db.query(SavedScholarship).filter(
        SavedScholarship.user_id == current_user.id,
        SavedScholarship.scholarship_id == req.scholarship_id
    ).first()
    if existing:
        return {"message": "Already saved"}
    saved = SavedScholarship(user_id=current_user.id,
                              scholarship_id=req.scholarship_id,
                              match_score=req.match_score)
    db.add(saved)
    db.commit()
    return {"message": "Scholarship saved successfully"}

@router.get("/saved")
def get_saved(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy.orm import joinedload
    saved = db.query(SavedScholarship).options(
        joinedload(SavedScholarship.scholarship)
    ).filter(SavedScholarship.user_id == current_user.id).all()
    result = []
    for s in saved:
        sch = s.scholarship
        if sch:
            result.append({"saved_id": s.id, "match_score": s.match_score, "status": s.status,
                           "scholarship": {"id": sch.id, "name": sch.name, "provider": sch.provider,
                                           "amount": sch.amount, "deadline": str(sch.deadline),
                                           "official_link": sch.official_link}})
    return result

@router.get("/{scholarship_id}")
def get_scholarship(scholarship_id: int, db: Session = Depends(get_db)):
    s = db.query(Scholarship).filter(Scholarship.id == scholarship_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    now = datetime.utcnow()
    return ScholarshipOut(
        id=s.id, name=s.name, provider=s.provider, amount=s.amount,
        deadline=s.deadline, eligibility=s.eligibility, category=s.category,
        state=s.state, field=s.field, official_link=s.official_link,
        description=s.description, source=s.source,
        days_left=max(0, (s.deadline - now).days) if s.deadline else None
    )