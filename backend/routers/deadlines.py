"""Deadline Tracker Router"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from database.db import get_db, Scholarship, SavedScholarship, User
from routers.auth import get_current_user

router = APIRouter()


@router.get("/upcoming")
def upcoming_deadlines(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all upcoming deadlines sorted by urgency"""
    saved = db.query(SavedScholarship).filter(SavedScholarship.user_id == current_user.id).all()
    saved_ids = [s.scholarship_id for s in saved]

    all_scholarships = db.query(Scholarship).filter(
        Scholarship.is_active == True,
        Scholarship.deadline != None,
        Scholarship.deadline > datetime.utcnow()
    ).order_by(Scholarship.deadline).all()

    now = datetime.utcnow()
    result = []
    for s in all_scholarships:
        days_left = (s.deadline - now).days
        urgency = "critical" if days_left <= 3 else "urgent" if days_left <= 7 else "normal"
        result.append({
            "id": s.id, "name": s.name, "provider": s.provider,
            "amount": s.amount, "deadline": s.deadline.isoformat(),
            "days_left": days_left, "urgency": urgency,
            "is_saved": s.id in saved_ids,
            "official_link": s.official_link,
        })
    return result


@router.get("/summary")
def deadline_summary(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    from datetime import timedelta

    total        = db.query(Scholarship).filter(Scholarship.is_active == True).count()
    expiring_7   = db.query(Scholarship).filter(
        Scholarship.deadline > now,
        Scholarship.deadline <= now + timedelta(days=7)
    ).count()
    expiring_30  = db.query(Scholarship).filter(
        Scholarship.deadline > now,
        Scholarship.deadline <= now + timedelta(days=30)
    ).count()

    return {"total_scholarships": total, "expiring_in_7_days": expiring_7,
            "expiring_in_30_days": expiring_30}
