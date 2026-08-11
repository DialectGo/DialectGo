"""
DialectGo PaddleOCR Microservice
---------------------------------
A lightweight FastAPI service that wraps PaddleOCR to provide high-accuracy
text extraction from images. Replaces the previous Tesseract.js integration.

Run with:
    python main.py
Or with uvicorn directly:
    uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""

import base64
import io
import logging

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
from PIL import Image
from pydantic import BaseModel

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dialectgo-ocr")

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="DialectGo PaddleOCR Microservice",
    description="Extracts text from images using PaddleOCR deep-learning pipeline.",
    version="1.0.0",
)

# Allow calls from the Node.js backend (localhost) during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# PaddleOCR initialization (loaded once at startup for performance)
# ---------------------------------------------------------------------------
# use_angle_cls=True  – handles rotated / skewed text from mobile photos
# lang='en'          – optimized for English; swap to 'ch' for Chinese, etc.
# ---------------------------------------------------------------------------
logger.info("Initializing PaddleOCR model (this may take a moment on first run)...")
# PaddleOCR 3.x API: use_textline_orientation replaces use_angle_cls
ocr_engine = PaddleOCR(use_textline_orientation=True, lang="en")
logger.info("PaddleOCR ready.")


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def run_ocr(img_array: np.ndarray) -> dict:
    """Run PaddleOCR on a decoded OpenCV image array and return structured results.
    Compatible with PaddleOCR 3.x API (uses predict() result structure).
    """
    result = ocr_engine.ocr(img_array)

    extracted_lines = []

    if result:
        for page_result in result:
            # Handle new PaddleX/PaddleOCR 3.x dictionary structure
            if isinstance(page_result, dict) and "rec_texts" in page_result:
                texts = page_result.get("rec_texts", [])
                scores = page_result.get("rec_scores", [])
                for i in range(len(texts)):
                    text = texts[i]
                    score = float(scores[i]) if i < len(scores) else 0.0
                    if text and str(text).strip():
                        extracted_lines.append({"text": str(text), "confidence": score})
                continue
                
            # Fallback for old PaddleOCR format
            items = page_result if isinstance(page_result, list) else [page_result]
            for item in items:
                if isinstance(item, dict):
                    text = item.get("rec_text", "")
                    score = float(item.get("rec_score", 0.0))
                elif isinstance(item, (list, tuple)) and len(item) >= 2:
                    text_box = item[1]
                    text = text_box[0] if isinstance(text_box, (list, tuple)) else str(text_box)
                    score = float(text_box[1]) if isinstance(text_box, (list, tuple)) and len(text_box) > 1 else 0.0
                else:
                    continue

                if text and str(text).strip():
                    extracted_lines.append({"text": str(text), "confidence": score})

    full_text = " ".join(item["text"] for item in extracted_lines)
    return {"full_text": full_text, "details": extracted_lines}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    """Simple health-check endpoint for the Node.js backend to ping."""
    return {"status": "ok", "service": "dialectgo-paddle-ocr"}


@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """
    Accept a multipart image file upload and return the extracted text.

    Used when the Node.js backend has a saved file path and forwards the file
    as a multipart form.
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            # Fallback for HEIC and other formats OpenCV misses natively
            try:
                pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
                img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            except Exception as e:
                logger.error(f"[extract-text] PIL fallback failed: {e}")
                raise HTTPException(status_code=400, detail="Invalid or unreadable image file.")

        logger.info(f"[extract-text] Processing uploaded file: {file.filename}")
        ocr_result = run_ocr(img)

        return {"success": True, **ocr_result}

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"[extract-text] Error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


class Base64ImageRequest(BaseModel):
    image: str  # Raw base64 string (no data URI prefix)


@app.post("/extract-text-base64")
async def extract_text_base64(payload: Base64ImageRequest):
    """
    Accept a raw base64-encoded image string and return the extracted text.

    This is the primary endpoint called by the Node.js backend's
    ocr.service.js when the mobile app sends an image as a base64 string
    (the existing API contract from the old Tesseract integration).
    """
    try:
        # Decode base64 to bytes, then to OpenCV image
        image_bytes = base64.b64decode(payload.image)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            # Fallback: try via PIL (handles some formats OpenCV misses)
            try:
                pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            except Exception:
                raise HTTPException(status_code=400, detail="Could not decode the base64 image.")

        logger.info("[extract-text-base64] Processing base64 image payload.")
        ocr_result = run_ocr(img)

        return {"success": True, **ocr_result}

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"[extract-text-base64] Error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
