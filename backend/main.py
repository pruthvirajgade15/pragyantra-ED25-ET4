

from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from contextlib import asynccontextmanager
import uvicorn
import os

from database.db import init_db
from routers import auth, scholarships, profile, essays, deadlines, documents, recommendations, chat

from scraper.scheduler import start_scheduler

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

@asynccontextmanager
async def lifespan(app: FastAPI):
    
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
    redirect_slashes=False,
)

# --- CORS ---
# Automatically permits all Vercel deployments (*.vercel.app), localhost, and any custom domains in CORS_ORIGINS
cors_origins_raw = os.getenv("CORS_ORIGINS", "")
allowed_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip() and o.strip() != "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth.router,         prefix="/api/auth",         tags=["Auth"])
app.include_router(scholarships.router, prefix="/api/scholarships",  tags=["Scholarships"])
app.include_router(profile.router,      prefix="/api/profile",       tags=["Profile"])
app.include_router(essays.router,       prefix="/api/essays",        tags=["Essays"])
app.include_router(deadlines.router,    prefix="/api/deadlines",     tags=["Deadlines"])
app.include_router(documents.router,       prefix="/api/documents",      tags=["Documents"])
app.include_router(recommendations.router, prefix="/api/recommendations",tags=["Recommendations"])
app.include_router(chat.router,         prefix="/api/chat",          tags=["Chatbot"])

@app.get("/health")
def health():
    return {"status": "healthy"}

if os.path.isdir(STATIC_DIR):
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"message": "ScholarshipHunter AI is running 🎓", "status": "ok"}
else:
    @app.get("/")
    def root():
        return {"message": "ScholarshipHunter AI is running 🎓", "status": "ok"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "7860"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=os.getenv("RELOAD", "false").lower() == "true")