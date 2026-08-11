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
    Returns bounding boxes and layout hints for spatial-aware translation.
    """
    result = ocr_engine.ocr(img_array)

    extracted_lines = []

    if result:
        for page_result in result:
            # Handle new PaddleX/PaddleOCR 3.x dictionary structure
            if isinstance(page_result, dict) and "rec_texts" in page_result:
                texts = page_result.get("rec_texts", [])
                scores = page_result.get("rec_scores", [])
                polys = page_result.get("rec_polys", [])
                for i in range(len(texts)):
                    text = texts[i]
                    score = float(scores[i]) if i < len(scores) else 0.0
                    # Extract bounding box as [x_min, y_min, x_max, y_max]
                    bbox = None
                    if i < len(polys):
                        try:
                            poly = polys[i]
                            xs = [int(p[0]) for p in poly]
                            ys = [int(p[1]) for p in poly]
                            bbox = [min(xs), min(ys), max(xs), max(ys)]
                        except Exception:
                            pass
                    if text and str(text).strip():
                        extracted_lines.append({
                            "text": str(text),
                            "confidence": score,
                            "bbox": bbox,
                            "line_index": len(extracted_lines),
                        })
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
                    extracted_lines.append({
                        "text": str(text),
                        "confidence": score,
                        "bbox": None,
                        "line_index": len(extracted_lines),
                    })

    # Build layout hints by grouping lines into paragraphs based on vertical gaps
    layout_hints = _compute_layout_hints(extracted_lines)

    full_text = " ".join(item["text"] for item in extracted_lines)
    return {"full_text": full_text, "details": extracted_lines, "layout_hints": layout_hints}


def _compute_layout_hints(lines: list) -> dict:
    """Group OCR lines into logical paragraphs/sections based on Y-coordinate gaps."""
    if not lines:
        return {"paragraphs": [], "detected_headers": []}

    # Sort by Y position (top of bounding box)
    sortable = [(i, l) for i, l in enumerate(lines) if l.get("bbox")]
    if not sortable:
        # No bounding box data — treat everything as one paragraph
        return {
            "paragraphs": [{"line_indices": list(range(len(lines))), "text": " ".join(l["text"] for l in lines)}],
            "detected_headers": [],
        }

    sortable.sort(key=lambda x: x[1]["bbox"][1])  # Sort by y_min

    paragraphs = []
    current_para_indices = [sortable[0][0]]
    prev_y_max = sortable[0][1]["bbox"][3]

    # Compute median line height for gap threshold
    heights = [l["bbox"][3] - l["bbox"][1] for _, l in sortable if l["bbox"][3] > l["bbox"][1]]
    median_height = sorted(heights)[len(heights) // 2] if heights else 30

    for idx, line in sortable[1:]:
        y_min = line["bbox"][1]
        gap = y_min - prev_y_max

        if gap > median_height * 1.2:
            # Significant gap → new paragraph
            para_text = " ".join(lines[i]["text"] for i in current_para_indices)
            paragraphs.append({"line_indices": current_para_indices, "text": para_text})
            current_para_indices = [idx]
        else:
            current_para_indices.append(idx)
        prev_y_max = line["bbox"][3]

    # Final paragraph
    if current_para_indices:
        para_text = " ".join(lines[i]["text"] for i in current_para_indices)
        paragraphs.append({"line_indices": current_para_indices, "text": para_text})

    # Detect headers: lines that are significantly shorter than median line width
    # and appear at the top of a paragraph group
    detected_headers = []
    for para in paragraphs:
        if para["line_indices"]:
            first_line = lines[para["line_indices"][0]]
            if first_line.get("bbox"):
                line_width = first_line["bbox"][2] - first_line["bbox"][0]
                # If line is short and has high confidence, likely a header
                if len(para["line_indices"]) == 1 and len(first_line["text"].split()) <= 6:
                    detected_headers.append(para["line_indices"][0])

    return {"paragraphs": paragraphs, "detected_headers": detected_headers}


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
