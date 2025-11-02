# Use lightweight Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies in one cached layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

# Copy only dependency list first (improves caching)
COPY requirements.txt .

# Upgrade pip and install dependencies efficiently
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy application code last (prevents cache invalidation)
# COPY . . (since we use volume)

# Create non-root user (avoids permission issues)
RUN useradd -m appuser
USER appuser

# Expose application port
EXPOSE 5000

# Run app
CMD ["python", "run.py"]
