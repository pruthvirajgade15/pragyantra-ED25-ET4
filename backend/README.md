---
title: ScholarshipHunter AI Backend
emoji: 🎓
colorFrom: blue
colorTo: cyan
sdk: docker
app_port: 7860
pinned: false
---

# ScholarshipHunter AI — Backend Service

High-performance FastAPI backend with Google Gemini AI integration, automated multi-source web scrapers, and JWT-authenticated student services.

**Built by Team Catalyst — Modern College of Engineering, Pune**  
*PRAGYANTRA 2026*

---

## 🚀 Key Modules & Capabilities

- **Auth Service (`routers/auth.py`)**: JWT authentication, bcrypt password hashing, and user profile management.
- **Scholarship Engine (`routers/scholarships.py`)**: Hybrid rule-based + Gemini 2.0 AI match scoring.
- **Prioritization Ranker (`routers/recommendations.py`)**: Multi-variable win probability and competition-level ranking.
- **AI Essay Studio (`routers/essays.py`)**: Bilingual (Hindi & English) scholarship essay generator.
- **AI Chatbot Assistant (`routers/chat.py`)**: Profile-aware conversational student advisor.
- **Document Vault (`routers/documents.py`)**: Gemini Vision OCR and form auto-fill aggregator.
- **Deadline Monitor (`routers/deadlines.py`)**: Real-time urgency calculation and deadline summaries.
- **Autonomous Scraper (`scraper/`)**: Daily background crawling (APScheduler + BeautifulSoup + NSP API).

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key | *Fallback to rule-based matcher* |
| `SECRET_KEY` | JWT signing secret | `scholarship2025secret` |
| `DATABASE_URL` | SQLite / PostgreSQL connection URI | `sqlite:///./scholarship.db` |
| `PORT` | Listening port | `7860` |
| `HOST` | Listening interface | `0.0.0.0` |

---

## 📦 Local Development

```bash
# Virtual environment setup
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server with live reload
python main.py
```

- API Base: `http://localhost:7860`
- Interactive OpenAPI Docs: `http://localhost:7860/docs`
