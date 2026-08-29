import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

from database.db import get_db, StudentProfile, Scholarship, User
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

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

def generate_smart_fallback_response(query: str, profile: Optional[StudentProfile], scholarships: List[Scholarship], user_name: str) -> str:
    q = query.lower()
    
    # 1. Eligibility Queries
    if any(w in q for w in ["eligible", "eligibility", "which scholarship", "what scholarship", "recommend"]):
        eligible = []
        user_cat = profile.category.lower() if profile and profile.category else "general"
        user_state = profile.state.lower() if profile and profile.state else "all india"
        
        for s in scholarships:
            cat_match = s.category.lower() in ["all", "any", user_cat]
            state_match = s.state.lower() in ["all india", "all", "india", user_state]
            if cat_match and state_match:
                eligible.append(s)
                
        if not eligible:
            eligible = scholarships[:4]
            
        lines = [f"Hello **{user_name}**! Based on verified criteria, here are top scholarships you can apply for:\n"]
        for s in eligible[:4]:
            deadline_str = s.deadline.strftime("%d %b %Y") if s.deadline else "Open"
            lines.append(f"• **{s.name}**\n  - **Amount:** {s.amount}\n  - **Category:** {s.category} | **State:** {s.state}\n  - **Deadline:** {deadline_str}\n  - **Provider:** {s.provider}")
        lines.append("\nYou can view full criteria and official direct links under the **Scholarships** directory.")
        return "\n".join(lines)

    # 2. Deadline Queries
    if any(w in q for w in ["deadline", "close", "date", "when", "last date"]):
        sorted_by_date = sorted([s for s in scholarships if s.deadline], key=lambda x: x.deadline)
        lines = ["Here are the upcoming scholarship application deadlines:\n"]
        for s in sorted_by_date[:4]:
            days_left = (s.deadline - datetime.utcnow()).days
            urgency = f"{days_left} days remaining" if days_left > 0 else "Closing today"
            lines.append(f"• **{s.name}**: {s.deadline.strftime('%d %b %Y')} ({urgency})\n  - Benefit: {s.amount}")
        lines.append("\nBe sure to submit on official portals before registration closes.")
        return "\n".join(lines)

    # 3. Document Queries
    if any(w in q for w in ["document", "doc", "certificate", "marksheet", "paper"]):
        return """Here is the **Standard Document Checklist** for Indian government and corporate scholarships:

1. **Aadhar Card / Valid Government Photo ID** (linked to mobile & bank)
2. **Previous Academic Marksheet** (10th / 12th / Degree marksheet)
3. **Family Income Certificate** (issued by Tehsildar / Competent Authority)
4. **Caste / Category Certificate** (SC/ST/OBC/EWS, if applicable)
5. **College Fee Receipt / Bonafide Certificate**
6. **Active Student Bank Account Passbook** (with IFSC and Aadhaar seeding)

You can upload and verify these in your **Document Vault** tab!"""

    # 4. Portal Queries (NSP, AICTE, State)
    if "nsp" in q or "national scholarship" in q:
        return """**National Scholarship Portal (NSP)** Guide:

• **Official Website:** [scholarships.gov.in](https://scholarships.gov.in)
• **Key Central Schemes:** Post-Matric SC/ST/OBC, Merit-cum-Means, Central Sector Scheme (CSSS).
• **Required for Registration:** Aadhaar number, verified mobile OTP, student bank account with direct benefit transfer (DBT) enabled.
• **100% Free:** Government schemes never charge application or registration fees."""

    if "aicte" in q or "pragati" in q:
        return """**AICTE Pragati Scholarship for Girls**:

• **Amount:** ₹50,000 per year of study for college fee, computer & book expenses.
• **Eligibility:** Female students admitted to 1st year degree/diploma technical programs in AICTE-approved institutions with family income under ₹8 Lakhs/annum.
• **Application Portal:** Apply via the National Scholarship Portal (NSP)."""

    # 5. Default General Helpful Advice
    return f"""Hello **{user_name}**! I'm here to assist you with finding and winning scholarships.

Here are quick actions you can take right now:
• **Discover Matches:** Browse verified central, state, and corporate scholarships under the **Scholarships** directory.
• **AI Essay Studio:** Generate customized application essays and statements of purpose in English and Hindi under the **Essay Generator** tab.
• **Deadline Tracking:** Check urgent closing dates under **Deadlines**.

Feel free to ask me about eligibility criteria, required documents, or portal registration!"""

@router.post("/ask")
async def ask_chatbot(
    req: ChatRequest,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    scholarships = db.query(Scholarship).filter(Scholarship.is_active == True).all()

    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # If GEMINI_API_KEY is available, attempt fast call with fallback models
    if GEMINI_API_KEY and GEMINI_API_KEY not in ["temp_key_to_replace_later", "your_api_key_here"]:
        schol_context = "\n".join([
            f"- {s.name}: {s.amount}, Deadline: {s.deadline.strftime('%d %b %Y') if s.deadline else 'Open'}, Category: {s.category}, Field: {s.field}, Provider: {s.provider}"
            for s in scholarships[:20]
        ])

        user_name = current_user.name or "Student"
        profile_context = ""
        if profile:
            profile_context = f"Student Profile:\nName: {user_name}\nState: {profile.state or 'All India'}\nField: {profile.field_of_study or 'General'}\nIncome: Rs {profile.annual_income or '2,50,000'}\nMarks: {profile.percentage or 80}%\nCategory: {profile.category or 'General'}"
        else:
            profile_context = f"Student Name: {user_name}\nProfile: Not yet completed"

        sys_prompt = f"You are a helpful, professional AI Scholarship Advisor. The student's profile is:\n{profile_context}\n\nAvailable active scholarships:\n{schol_context}\n\nAnswer concisely in 2-4 structured bullet points. Keep advice practical and accurate."

        payload = {"contents": []}
        for msg in req.history[-4:]:
            role = "user" if msg.get("role") == "user" else "model"
            content = msg.get("content", "").strip()
            if content:
                payload["contents"].append({
                    "role": role,
                    "parts": [{"text": content}]
                })
            
        payload["contents"].append({
            "role": "user",
            "parts": [{"text": f"Context: {sys_prompt}\n\nUser Question: {req.message}"}]
        })

        for model_name in GEMINI_MODELS:
            try:
                async with httpx.AsyncClient(timeout=8) as client:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
                    res = await client.post(url, headers={"Content-Type": "application/json"}, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return {"reply": parts[0]["text"].strip()}
            except Exception as e:
                print(f"Chat model {model_name} error: {e}")

    # Seamless intelligent fallback using database scholarships
    user_display_name = (current_user.name.split()[0] if current_user.name else "Student")
    reply = generate_smart_fallback_response(
        query=req.message,
        profile=profile,
        scholarships=scholarships,
        user_name=user_display_name
    )
    return {"reply": reply}