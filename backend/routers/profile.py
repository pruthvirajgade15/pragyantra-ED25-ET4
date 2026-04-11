"""Student Profile Router"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database.db import get_db, StudentProfile, User
from routers.auth import get_current_user

router = APIRouter()


class ProfileRequest(BaseModel):
    full_name:      str
    annual_income:  float
    percentage:     float
    category:       str   # SC/ST/OBC/General/EWS/Minority
    state:          str
    field_of_study: str
    gender:         str
    dob:            Optional[str] = ""
    religion:       Optional[str] = ""
    disability:     bool = False
    is_minority:    bool = False
    current_year:   int  = 1
    college:        str  = ""
    phone:          Optional[str] = ""


@router.post("/")
def upsert_profile(req: ProfileRequest, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if profile:
        for k, v in req.dict().items():
            setattr(profile, k, v)
    else:
        profile = StudentProfile(user_id=current_user.id, **req.dict())
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return {"message": "Profile saved", "profile_id": profile.id}


@router.get("/")
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        return None
    return {
        "full_name": profile.full_name, "annual_income": profile.annual_income,
        "percentage": profile.percentage, "category": profile.category,
        "state": profile.state, "field_of_study": profile.field_of_study,
        "gender": profile.gender, "dob": profile.dob, "disability": profile.disability,
        "is_minority": profile.is_minority, "current_year": profile.current_year,
        "college": profile.college, "phone": profile.phone,
        "religion": profile.religion,
    }
