# DialectGo OCR Service

A lightweight Python **FastAPI** microservice that provides high-accuracy text extraction from images using **PaddleOCR**. This replaces the previous `tesseract.js` integration in the Node.js backend.

## Architecture

```
[ React Native App ]
       │  (sends base64 image)
       ▼
[ Node.js Express Backend ]  ←→  backend/app/services/ocr.service.js
       │  (forwards to OCR service via HTTP)
       ▼
[ Python FastAPI OCR Service ]   ← You are here
       │  (runs PaddleOCR inference)
       ▼
[ Node.js Translation Pipeline ]
    Tokenizer → Corpus Lookup → NLLB / LLM Meta-Layer
```

## Prerequisites

- Python **3.8 – 3.10** (PaddleOCR requires Python ≤ 3.10)
- pip

> **Tip:** Use a virtual environment to isolate dependencies.

## Setup

```bash
# 1. Navigate to this folder
cd ocr-service

# 2. (Recommended) Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # macOS / Linux
# venv\Scripts\activate       # Windows

# 3. Install dependencies
pip install -r requirements.txt
```

> **Note:** On first run, PaddleOCR will automatically download the required model weights (~100 MB). Ensure you have an internet connection.

## Running the Service

```bash
# Simple start (auto-reloads on file change)
python main.py

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The service will be available at `http://localhost:8001`.

## API Endpoints

### `GET /health`
Health check. Returns `{ "status": "ok" }`.

### `POST /extract-text`
Accepts a **multipart image file** upload.

```bash
curl -X POST http://localhost:8001/extract-text \
  -F "file=@/path/to/image.jpg"
```

Response:
```json
{
  "success": true,
  "full_text": "The extracted text block",
  "details": [
    { "text": "Hello", "confidence": 0.997 },
    { "text": "World", "confidence": 0.983 }
  ]
}
```

### `POST /extract-text-base64`
Accepts a **JSON body with a raw base64 string** (no data URI prefix). This is the primary endpoint called by the Node.js backend.

```bash
curl -X POST http://localhost:8001/extract-text-base64 \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64_encoded_image_string>"}'
```

Response: Same format as `/extract-text`.

## Environment Variables

The Node.js backend needs:
```
PADDLE_OCR_URL=http://localhost:8001
```

This is already added to `backend/.env`.

## Troubleshooting

| Problem | Solution |
|---|---|
| `paddleocr` install fails | Ensure Python ≤ 3.10. Try `pip install paddlepaddle` first. |
| Model weights not downloading | Check internet connection. Try `ocr = PaddleOCR(use_angle_cls=True, lang='en')` in a Python shell manually. |
| Port 8001 already in use | Change the port in `main.py` and update `PADDLE_OCR_URL` in `.env`. |
