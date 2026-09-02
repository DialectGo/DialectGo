"""
DialectGo PaddleOCR Microservice
---------------------------------
A lightweight FastAPI service that wraps PaddleOCR to provide high-accuracy
text extraction from images.

Run with:
    python main.py

Or with uvicorn directly:
    uvicorn main:app --host 0.0.0.0 --port 8001
"""

import base64
import io
import logging
import os

# ---------------------------------------------------------------------------
# Disable PaddlePaddle CPU optimizations that can cause oneDNN/PIR runtime
# errors in some PaddlePaddle/PaddleOCR version combinations.
# ---------------------------------------------------------------------------
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
from PIL import Image
from pydantic import BaseModel

# Optional HEIC/HEIF support
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


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# PaddleOCR initialization
# ---------------------------------------------------------------------------

logger.info(
    "Initializing PaddleOCR model "
    "(this may take a moment on first run)..."
)

try:
    ocr_engine = PaddleOCR(
    lang="en",
    device="cpu",
    enable_mkldnn=False,
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    text_detection_model_name="PP-OCRv5_mobile_det",
    )

    logger.info("PaddleOCR ready.")

except Exception as exc:
    logger.exception("Failed to initialize PaddleOCR: %s", exc)
    raise


# ---------------------------------------------------------------------------
# OCR helper
# ---------------------------------------------------------------------------

def run_ocr(img_array: np.ndarray) -> dict:
    """
    Run PaddleOCR on a decoded OpenCV image array.

    Uses PaddleOCR 3.x predict() API.

    Returns:
        {
            "full_text": "...",
            "details": [...],
            "layout_hints": {...}
        }
    """

    logger.info("Starting OCR inference...")

    # -----------------------------------------------------------------------
    # PaddleOCR 3.x inference
    # -----------------------------------------------------------------------
    result = ocr_engine.predict(img_array)

    extracted_lines = []

    if not result:
        logger.warning("PaddleOCR returned no results.")

        return {
            "full_text": "",
            "details": [],
            "layout_hints": {
                "paragraphs": [],
                "detected_headers": [],
            },
        }

    # -----------------------------------------------------------------------
    # Parse PaddleOCR 3.x result objects
    # -----------------------------------------------------------------------
    for page_result in result:

        data = None

        # PaddleOCR 3.x result object generally exposes .json
        if hasattr(page_result, "json"):
            try:
                data = page_result.json

                # Some versions may expose JSON as a string.
                if isinstance(data, str):
                    import json

                    data = json.loads(data)

            except Exception as exc:
                logger.warning(
                    "Unable to read PaddleOCR result JSON: %s",
                    exc
                )
                data = None

        # -------------------------------------------------------------------
        # Dictionary fallback
        # -------------------------------------------------------------------
        if data is None and isinstance(page_result, dict):
            data = page_result

        if not isinstance(data, dict):
            logger.warning(
                "Unsupported PaddleOCR result type: %s",
                type(page_result)
            )
            continue

        texts = data.get("rec_texts", [])
        scores = data.get("rec_scores", [])
        polys = data.get("rec_polys", [])

        # Make sure these are iterable
        if texts is None:
            texts = []

        if scores is None:
            scores = []

        if polys is None:
            polys = []

        # -------------------------------------------------------------------
        # Extract individual text lines
        # -------------------------------------------------------------------
        for i, text in enumerate(texts):

            if text is None:
                continue

            text = str(text).strip()

            if not text:
                continue

            # Confidence
            try:
                score = float(scores[i]) if i < len(scores) else 0.0
            except (TypeError, ValueError):
                score = 0.0

            # Bounding box
            bbox = None

            if i < len(polys):
                try:
                    poly = polys[i]

                    # Convert numpy arrays to normal Python lists if needed.
                    if hasattr(poly, "tolist"):
                        poly = poly.tolist()

                    xs = [int(point[0]) for point in poly]
                    ys = [int(point[1]) for point in poly]

                    if xs and ys:
                        bbox = [
                            min(xs),
                            min(ys),
                            max(xs),
                            max(ys),
                        ]

                except Exception as exc:
                    logger.debug(
                        "Could not parse polygon for line %s: %s",
                        i,
                        exc
                    )

            extracted_lines.append(
                {
                    "text": text,
                    "confidence": score,
                    "bbox": bbox,
                    "line_index": len(extracted_lines),
                }
            )

    # -----------------------------------------------------------------------
    # Layout processing
    # -----------------------------------------------------------------------

    layout_hints = _compute_layout_hints(extracted_lines)

    full_text = " ".join(
        item["text"]
        for item in extracted_lines
    )

    logger.info(
        "OCR complete. Extracted %d text lines.",
        len(extracted_lines)
    )

    return {
        "full_text": full_text,
        "details": extracted_lines,
        "layout_hints": layout_hints,
    }


# ---------------------------------------------------------------------------
# Layout helper
# ---------------------------------------------------------------------------

def _compute_layout_hints(lines: list) -> dict:
    """
    Group OCR lines into logical paragraphs/sections
    based on Y-coordinate gaps.
    """

    if not lines:
        return {
            "paragraphs": [],
            "detected_headers": [],
        }

    # -----------------------------------------------------------------------
    # Keep only lines that have bounding boxes.
    # -----------------------------------------------------------------------

    sortable = [
        (i, line)
        for i, line in enumerate(lines)
        if line.get("bbox")
    ]

    # -----------------------------------------------------------------------
    # No bounding boxes
    # -----------------------------------------------------------------------

    if not sortable:
        return {
            "paragraphs": [
                {
                    "line_indices": list(range(len(lines))),
                    "text": " ".join(
                        line["text"]
                        for line in lines
                    ),
                }
            ],
            "detected_headers": [],
        }

    # -----------------------------------------------------------------------
    # Sort by Y position
    # -----------------------------------------------------------------------

    sortable.sort(
        key=lambda x: x[1]["bbox"][1]
    )

    paragraphs = []

    current_para_indices = [
        sortable[0][0]
    ]

    prev_y_max = sortable[0][1]["bbox"][3]

    # -----------------------------------------------------------------------
    # Calculate median line height
    # -----------------------------------------------------------------------

    heights = [
        line["bbox"][3] - line["bbox"][1]
        for _, line in sortable
        if line["bbox"][3] > line["bbox"][1]
    ]

    if heights:
        sorted_heights = sorted(heights)
        median_height = sorted_heights[
            len(sorted_heights) // 2
        ]
    else:
        median_height = 30

    # -----------------------------------------------------------------------
    # Group lines into paragraphs
    # -----------------------------------------------------------------------

    for idx, line in sortable[1:]:

        y_min = line["bbox"][1]

        gap = y_min - prev_y_max

        if gap > median_height * 1.2:

            para_text = " ".join(
                lines[i]["text"]
                for i in current_para_indices
            )

            paragraphs.append(
                {
                    "line_indices": current_para_indices,
                    "text": para_text,
                }
            )

            current_para_indices = [idx]

        else:
            current_para_indices.append(idx)

        prev_y_max = line["bbox"][3]

    # -----------------------------------------------------------------------
    # Final paragraph
    # -----------------------------------------------------------------------

    if current_para_indices:

        para_text = " ".join(
            lines[i]["text"]
            for i in current_para_indices
        )

        paragraphs.append(
            {
                "line_indices": current_para_indices,
                "text": para_text,
            }
        )

    # -----------------------------------------------------------------------
    # Header detection
    # -----------------------------------------------------------------------

    detected_headers = []

    for para in paragraphs:

        if not para["line_indices"]:
            continue

        first_line = lines[
            para["line_indices"][0]
        ]

        if first_line.get("bbox"):

            if (
                len(para["line_indices"]) == 1
                and len(first_line["text"].split()) <= 6
            ):
                detected_headers.append(
                    para["line_indices"][0]
                )

    return {
        "paragraphs": paragraphs,
        "detected_headers": detected_headers,
    }


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    """
    Simple health-check endpoint for the Node.js backend.
    """

    return {
        "status": "ok",
        "service": "dialectgo-paddle-ocr",
    }


# ---------------------------------------------------------------------------
# Version/debug endpoint
# ---------------------------------------------------------------------------

@app.get("/versions")
async def versions():
    """
    Returns PaddlePaddle and PaddleOCR versions.

    Useful for checking which versions are installed
    inside the Google Cloud Docker container.
    """

    try:
        import paddle
        import paddleocr

        return {
            "paddlepaddle": paddle.__version__,
            "paddleocr": paddleocr.__version__,
        }

    except Exception as exc:
        logger.exception(
            "Unable to retrieve package versions."
        )

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ---------------------------------------------------------------------------
# Image decoding helper
# ---------------------------------------------------------------------------

def decode_image(image_bytes: bytes) -> np.ndarray:
    """
    Decode uploaded image bytes into an OpenCV BGR image.
    """

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Empty image file.",
        )

    # -----------------------------------------------------------------------
    # Try OpenCV first
    # -----------------------------------------------------------------------

    nparr = np.frombuffer(
        image_bytes,
        np.uint8,
    )

    img = cv2.imdecode(
        nparr,
        cv2.IMREAD_COLOR,
    )

    if img is not None:
        return img

    # -----------------------------------------------------------------------
    # PIL fallback for HEIC and other formats
    # -----------------------------------------------------------------------

    try:

        pil_img = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

        img = cv2.cvtColor(
            np.array(pil_img),
            cv2.COLOR_RGB2BGR,
        )

        return img

    except Exception as exc:

        logger.error(
            "PIL image decoding failed: %s",
            exc
        )

        raise HTTPException(
            status_code=400,
            detail="Invalid or unreadable image file.",
        )


# ---------------------------------------------------------------------------
# Extract text endpoint
# ---------------------------------------------------------------------------

@app.post("/extract-text")
async def extract_text(
    file: UploadFile = File(...)
):
    """
    Accept a multipart image upload and return extracted text.
    """

    try:

        contents = await file.read()

        img = decode_image(contents)

        logger.info(
            "[extract-text] Processing uploaded file: %s",
            file.filename,
        )

        ocr_result = run_ocr(img)

        return {
            "success": True,
            **ocr_result,
        }

    except HTTPException:
        raise

    except Exception as exc:

        logger.exception(
            "[extract-text] Error: %s",
            exc
        )

        raise HTTPException(
            status_code=500,
            detail=f"OCR extraction failed: {str(exc)}",
        )


# ---------------------------------------------------------------------------
# Base64 request model
# ---------------------------------------------------------------------------

class Base64ImageRequest(BaseModel):
    image: str


# ---------------------------------------------------------------------------
# Base64 extraction endpoint
# ---------------------------------------------------------------------------

@app.post("/extract-text-base64")
async def extract_text_base64(
    payload: Base64ImageRequest
):
    """
    Accept a raw base64-encoded image and return extracted text.

    This endpoint is intended for the Node.js backend.
    """

    try:

        # -------------------------------------------------------------------
        # Decode base64
        # -------------------------------------------------------------------

        try:
            image_bytes = base64.b64decode(
                payload.image,
                validate=True,
            )

        except Exception as exc:

            logger.error(
                "Base64 decoding failed: %s",
                exc
            )

            raise HTTPException(
                status_code=400,
                detail="Invalid base64 image data.",
            )

        # -------------------------------------------------------------------
        # Decode image
        # -------------------------------------------------------------------

        img = decode_image(image_bytes)

        logger.info(
            "[extract-text-base64] Processing base64 image."
        )

        # -------------------------------------------------------------------
        # OCR
        # -------------------------------------------------------------------

        ocr_result = run_ocr(img)

        return {
            "success": True,
            **ocr_result,
        }

    except HTTPException:
        raise

    except Exception as exc:

        logger.exception(
            "[extract-text-base64] Error: %s",
            exc
        )

        raise HTTPException(
            status_code=500,
            detail=f"OCR extraction failed: {str(exc)}",
        )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":

    import uvicorn

    port = int(
        os.environ.get(
            "PORT",
            8001,
        )
    )

    logger.info(
        "Starting DialectGo OCR service on port %s",
        port,
    )

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
    )