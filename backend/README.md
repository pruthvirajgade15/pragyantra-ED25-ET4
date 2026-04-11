---
title: ScholarshipHunter AI Backend
emoji: 🎓
colorFrom: blue
colorTo: cyan
sdk: docker
app_port: 7860
pinned: false
---

# ScholarshipHunter AI — Backend API

AI-powered scholarship discovery for Indian students from underrepresented backgrounds.

**Built by Team Catalyst — Modern College of Engineering, Pune**  
PRAGYANTRA Hackathon 2025

## API Endpoints

- `GET /` — Health check
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/scholarships/matched` — AI-matched scholarships
- `POST /api/essays/generate` — Generate scholarship essay
- `GET /api/deadlines/upcoming` — Upcoming deadlines

## Environment Variables (Set in HF Space Settings)

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Claude API key |
| `SECRET_KEY` | JWT secret (any random string) |
| `DATABASE_URL` | SQLite (default) or PostgreSQL |
