"""
ScholarshipHunter AI — FastAPI Backend
Team Catalyst | Modern College of Engineering, Pune
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from contextlib import asynccontextmanager
import uvicorn
import os

from database.db import init_db
from routers import auth, scholarships, profile, essays, deadlines, documents, recommendations, chat

from scraper.scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB + start scraper scheduler"""
    init_db()
    start_scheduler()
    print("[OK] ScholarshipHunter Backend Started")
    yield
    print("[STOP] Backend shutting down")


app = FastAPI(
    title="ScholarshipHunter AI",
    description="AI-powered scholarship discovery for underrepresented students",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount it
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router,         prefix="/api/auth",         tags=["Auth"])
app.include_router(scholarships.router, prefix="/api/scholarships",  tags=["Scholarships"])
app.include_router(profile.router,      prefix="/api/profile",       tags=["Profile"])
app.include_router(essays.router,       prefix="/api/essays",        tags=["Essays"])
app.include_router(deadlines.router,    prefix="/api/deadlines",     tags=["Deadlines"])
app.include_router(documents.router,       prefix="/api/documents",      tags=["Documents"])
app.include_router(recommendations.router, prefix="/api/recommendations",tags=["Recommendations"])
app.include_router(chat.router,         prefix="/api/chat",          tags=["Chatbot"])


@app.get("/")
def root():
    return {"message": "ScholarshipHunter AI is running 🎓", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)
