/**
 * ocr.service.js
 * ---------------
 * Node.js integration service for the DialectGo PaddleOCR FastAPI microservice.
 *
 * This module replaces the old tesseract.js calls with HTTP requests to the
 * dedicated Python OCR service running at PADDLE_OCR_URL.
 *
 * Endpoints used:
 *   POST /extract-text-base64  – accepts a raw base64 image string (no data URI prefix)
 *   POST /extract-text         – accepts a multipart file upload
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const OCR_BASE_URL = process.env.PADDLE_OCR_URL || 'http://localhost:8001';

/**
 * Extracts text from a base64-encoded image string by calling the
 * PaddleOCR FastAPI microservice.
 *
 * @param {string} base64Image  - Raw base64 string (data URI prefix already stripped)
 * @returns {Promise<string>}   - The full extracted text block
 * @throws {Error}              - If the OCR service is unreachable or returns an error
 */
export const extractTextFromBase64 = async (base64Image) => {
    try {
        const response = await axios.post(
            `${OCR_BASE_URL}/extract-text-base64`,
            { image: base64Image },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000, // 30 s – OCR can be slow on first model load
            }
        );

        if (response.data?.success) {
            return {
                text: response.data.full_text || '',
                details: response.data.details || [],
                layoutHints: response.data.layout_hints || null,
            };
        }

        throw new Error('PaddleOCR returned an unsuccessful response.');
    } catch (error) {
        // Provide a clear error message distinguishing connection vs. service errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new Error(
                `PaddleOCR microservice is not reachable at ${OCR_BASE_URL}. ` +
                'Please start the ocr-service (cd ocr-service && python main.py).'
            );
        }

        const detail = error.response?.data?.detail || error.message;
        console.error('[OCR Service] extractTextFromBase64 error:', detail);
        throw new Error(`OCR extraction failed: ${detail}`);
    }
};

/**
 * Extracts text from an image file on disk by calling the
 * PaddleOCR FastAPI microservice as a multipart upload.
 *
 * @param {string} filePath     - Absolute path to the image file
 * @returns {Promise<string>}   - The full extracted text block
 * @throws {Error}              - If the file is missing or the OCR service errors
 */
export const extractTextFromFile = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`OCR: Image file not found at path: ${filePath}`);
    }

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const response = await axios.post(
            `${OCR_BASE_URL}/extract-text`,
            form,
            {
                headers: form.getHeaders(),
                timeout: 30000,
            }
        );

        if (response.data?.success) {
            return {
                text: response.data.full_text || '',
                details: response.data.details || [],
                layoutHints: response.data.layout_hints || null,
            };
        }

        throw new Error('PaddleOCR returned an unsuccessful response.');
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new Error(
                `PaddleOCR microservice is not reachable at ${OCR_BASE_URL}. ` +
                'Please start the ocr-service (cd ocr-service && python main.py).'
            );
        }

        const detail = error.response?.data?.detail || error.message;
        console.error('[OCR Service] extractTextFromFile error:', detail);
        throw new Error(`OCR extraction failed: ${detail}`);
    }
};
