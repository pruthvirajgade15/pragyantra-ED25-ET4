import os
import json
import base64
import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.db import get_db, Document, User
from routers.auth import get_current_user

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".pdf"]:
        raise HTTPException(status_code=400, detail="Only JPG, PNG and PDF allowed")
        
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
        
    parsed_data_json = "{}"
    if GEMINI_API_KEY:
        try:
            mime_type = "application/pdf" if file_ext == ".pdf" else f"image/{file_ext[1:].replace('jpg','jpeg')}"
            encoded_content = base64.b64encode(contents).decode('utf-8')
            
            prompt_text = f"Analyze this {doc_type}. Extract relevant structured information (like name, dates, income value, percentage, register number, etc.). Return ONLY a valid JSON object. No markdown wrapping."
            
            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt_text},
                        {"inline_data": {"mime_type": mime_type, "data": encoded_content}}
                    ]
                }]
            }
            
            async with httpx.AsyncClient(timeout=30) as client:
                res = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}",
                    headers={"Content-Type": "application/json"},
                    json=payload
                )
                
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    if raw_text.startswith("```json"):
                        raw_text = raw_text[7:-3].strip()
                    elif raw_text.startswith("```"):
                        raw_text = raw_text[3:-3].strip()
                        
                    parsed_data_json = json.dumps(json.loads(raw_text))
                else:
                    print(f"Gemini Vision API Error: {res.text}")
                    
        except Exception as e:
            print(f"Failed to parse document with AI: {e}")
            parsed_data_json = json.dumps({"error": "Failed to parse automatically"})
            
    new_doc = Document(
        user_id=current_user.id,
        doc_type=doc_type,
        file_path=unique_filename,
        parsed_data=parsed_data_json
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    return {
        "id": new_doc.id,
        "doc_type": new_doc.doc_type,
        "file_url": f"/uploads/{new_doc.file_path}",
        "parsed_data": json.loads(new_doc.parsed_data or "{}")
    }

@router.get("/")
def get_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    result = []
    for d in docs:
        result.append({
            "id": d.id,
            "doc_type": d.doc_type,
            "file_url": f"/uploads/{d.file_path}",
            "parsed_data": json.loads(d.parsed_data or "{}"),
            "uploaded_at": d.uploaded_at
        })
    return result

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if doc:
        path = os.path.join(UPLOAD_DIR, doc.file_path)
        if os.path.exists(path):
            try:
                os.remove(path)
            except:
                pass
        db.delete(doc)
        db.commit()
    return {"message": "Document deleted"}

@router.post("/auto-fill")
def auto_fill_form(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    aggregated_data = {}
    
    for doc in docs:
        try:
            data = json.loads(doc.parsed_data)
            if isinstance(data, dict):
                prefix = doc.doc_type + "_"
                for k, v in data.items():
                    aggregated_data[prefix + k] = v
        except:
            pass
            
    return {"auto_fill_data": aggregated_data}