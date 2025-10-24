FROM python:3.12-slim

WORKDIR /app

# Copy requirements and install dependencies first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app files
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Launch the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
