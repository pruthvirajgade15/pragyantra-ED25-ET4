---
title: ScholarshipHunter AI
emoji: 🎓
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: true
license: mit
short_description: AI-powered scholarship discovery platform
---

# 🎓 ScholarshipHunter AI
### Team Catalyst | Modern College of Engineering, Pune | PRAGYANTRA 2026

> **Find every scholarship you deserve. AI-powered. Auto-updated. 100% Free.**

---

## 🌟 What Makes Us Different

| Feature | Others | ScholarshipHunter AI |
|---|---|---|
| Scholarship listing | ✅ Static lists | ✅ **Personalized AI recommendation engine** |
| Deadline tracking | ✅ Basic reminders | ✅ **AI-based prediction & prioritization** |
| Application help | ✅ Form links | ✅ **AI-assisted content generation** |
| Eligibility check | ❌ Manual | ✅ **ML-powered match scoring (e.g. 92% eligible)** |
| Document handling | ❌ None | ✅ **Secure storage + auto-fill** |
| Data source | ❌ Manual entry | ✅ **Government APIs + real-time scraper** |

---

## 📁 Project Structure

```
scholarship-hunter/
├── backend/                        ← FastAPI Python backend
│   ├── main.py                     ← Entry point
│   ├── requirements.txt
│   ├── Dockerfile                  ← Hugging Face Docker deployment
│   ├── .env.example
│   ├── database/db.py              ← SQLAlchemy models + seeder (20+ scholarships)
│   ├── routers/
│   │   ├── auth.py                 ← JWT login/register
│   │   ├── scholarships.py         ← AI matching + browse + save
│   │   ├── essays.py               ← Hindi/English essay generator
│   │   ├── profile.py              ← Student profile CRUD
│   │   ├── deadlines.py            ← Deadline tracker
│   │   ├── documents.py            ← Document manager (upload, store, auto-fill)
│   │   └── recommendations.py      ← AI prioritization engine
│   ├── ml/
│   │   ├── eligibility_model.py    ← ML eligibility matcher (match % scoring)
│   │   └── priority_ranker.py      ← Win probability + competition-level ranker
│   └── scraper/
│       ├── scheduler.py            ← Auto web scraper (11:30 PM IST daily)
│       ├── gov_api.py              ← Government scholarship API integrations
│       └── bs4_scraper.py          ← BeautifulSoup web scraper
│
├── frontend/                       ← React + Vite + TailwindCSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                 ← Router + Auth provider
│       ├── index.css               ← Global styles
│       ├── components/
│       │   ├── Navbar.jsx          ← Responsive + language toggle
│       │   ├── ScholarshipCard.jsx ← Match % badge + priority rank
│       │   └── DocumentVault.jsx   ← Upload + auto-fill manager
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx       ← Login + Register
│       │   ├── DashboardPage.jsx   ← AI-ranked recommendations
│       │   ├── ScholarshipsPage.jsx
│       │   ├── EssayPage.jsx
│       │   ├── DeadlinesPage.jsx
│       │   ├── DocumentsPage.jsx   ← NEW: Document vault
│       │   └── ProfilePage.jsx
│       ├── hooks/useAuth.jsx
│       ├── utils/api.js
│       └── i18n/translations.js    ← Hindi + English
│
└── README.md
```

---

## ✨ Core Features

### 🤖 AI Eligibility Matching Engine
Uses ML to automatically match a student's profile against every scholarship in the database and surfaces a **match percentage** (e.g. *92% eligible*) for each result — so students instantly know where they stand without reading fine print.

- Rule-based scoring across income, category, state, marks, and course
- Weighted ML model trained on historical scholarship eligibility criteria
- Falls back to rule-based scoring if no Anthropic API key is configured

### 🏆 Scholarship Prioritization
AI ranks your matched scholarships not just by eligibility, but by **win probability** — factoring in:

- Estimated competition level (niche vs. national-level)
- Award amount vs. effort required
- Application deadline proximity
- Your profile strength relative to typical applicants

### 📁 Document Manager
A secure vault for all your application documents:

- Upload income certificates, marksheets, caste/disability certificates, and photos once
- Documents are stored securely and re-used across multiple applications
- **Auto-fill** — the AI pre-populates application forms using stored documents
- Supports PDF, JPG, and PNG formats

### 🌐 Government Scholarship APIs + Web Scraping
Data is sourced from authoritative, up-to-date channels:

- **NSP (National Scholarship Portal)** API integration for Central Government schemes
- **State government portals** scraped via BeautifulSoup for Maharashtra, UP, Karnataka, and more
- Daily scraper runs at **11:30 PM IST** to catch new openings and deadline changes
- Results are de-duplicated and enriched before being stored

### ✍️ AI Essay Generator
Generates tailored scholarship essays in **Hindi or English**:

- Incorporates your profile data (background, achievements, goals) automatically
- Prompts are structured for statement-of-purpose and financial-need formats
- Drafts are saved and editable within the app

### ⏰ Deadline Tracker
- Visual countdown circles with urgency levels (Critical / Soon / Comfortable)
- AI-predicted "last safe application date" based on document preparation time
- Push-style reminders from the dashboard

### 🌍 Bilingual UI (EN / HI)
Full UI toggle between English and Hindi — every label, error message, and generated content.

---

## 🚀 Step-by-Step Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Anthropic API key → get free at https://console.anthropic.com

---

### STEP 1 — Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env: add your ANTHROPIC_API_KEY

# Start backend
python main.py
```

Backend → http://localhost:7860  
API Docs → http://localhost:7860/docs  
On first start: DB auto-creates, 20+ scholarships seeded, scraper runs once.

---

### STEP 2 — Frontend

```bash
cd frontend

npm install

cp .env.example .env
# .env already set to http://localhost:7860/api for local dev

npm run dev
```

Frontend → http://localhost:3000

---

### STEP 3 — Use the App

1. **Register** an account
2. **Fill your Profile** — income, marks, category, state (30 seconds)
3. **Upload Documents** — income cert, marksheets, photo (one-time setup)
4. Go to **Dashboard** — AI matches and ranks scholarships with % scores and win probability
5. Use **Essay Generator** — pick Hindi or English, click Generate
6. Check **Deadlines** — visual countdown with urgency levels
7. **Apply** — auto-filled forms pulled from your document vault

---

## 🌐 Deploy to Hugging Face

### Backend (Docker Space)

1. huggingface.co → New Space → SDK: **Docker**
2. Name: `scholarship-hunter-backend`
3. Upload all files from `backend/` folder
4. In Settings → Secrets, add:
   - `ANTHROPIC_API_KEY`
   - `SECRET_KEY` (any random string)
5. Space builds and deploys automatically

### Frontend (Static Space)

```bash
cd frontend
# Edit .env:
# VITE_API_URL=https://YOUR-USERNAME-scholarship-hunter-backend.hf.space/api
npm run build
```

1. New Space → SDK: **Static**
2. Name: `scholarship-hunter`
3. Upload contents of `frontend/dist/` folder
4. Done — live at `https://YOUR-USERNAME-scholarship-hunter.hf.space`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | FastAPI, SQLAlchemy, SQLite |
| AI / LLM | Anthropic Claude (claude-sonnet) |
| ML Matching | Scikit-learn, rule-based scoring |
| Scraping | BeautifulSoup4, APScheduler |
| Gov APIs | NSP API, state portal integrations |
| Auth | JWT (python-jose) |
| Deployment | Hugging Face Spaces (Docker + Static) |

---

## 👥 Team Catalyst

**Sanika Chowdhary · Amar Bhise · Sattvik Bhogade · Pruthaviraj Gade**  
Dept. of AI & Data Science — Modern College of Engineering, Pune  
*PRAGYANTRA 2026*