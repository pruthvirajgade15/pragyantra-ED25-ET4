FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create init files for Python packages
RUN touch database/__init__.py routers/__init__.py scraper/__init__.py

# Expose port (Hugging Face uses 7860)
EXPOSE 7860

# Environment defaults
ENV PORT=7860
ENV HOST=0.0.0.0
ENV DATABASE_URL=sqlite:///./scholarship_hunter.db

# Start server
CMD ["python", "main.py"]
