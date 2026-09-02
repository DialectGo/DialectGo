# Use Python 3.11 for maximum compatibility with Paddle 3.2.2
FROM python:3.11-slim

# Disable MKLDNN globally to prevent PIR engine conversion crashes on CPU
ENV PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT=0
ENV FLAGS_use_mkldnn=0

# Set working directory
WORKDIR /app

# Install system dependencies required by OpenCV and PaddleOCR
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Cloud Run sets PORT automatically, defaults to 8080)
ENV PORT=8080

# Command to run application via Uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]