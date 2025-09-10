FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY backend/ ./backend/
COPY logs/ ./logs/

# Make sure logs directory exists
RUN mkdir -p logs

# Expose port
EXPOSE 8000

# Set environment variables
ENV FLASK_ENV=production
ENV PORT=8000

# Run the application
CMD ["python", "backend/main.py"]
