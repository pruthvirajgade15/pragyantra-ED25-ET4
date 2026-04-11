FROM node:18-slim AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN touch database/__init__.py routers/__init__.py scraper/__init__.py

COPY --from=frontend-build /frontend/dist /app/static

RUN mkdir -p /app/uploads

EXPOSE 7860

ENV PORT=7860
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

CMD ["python", "main.py"]
