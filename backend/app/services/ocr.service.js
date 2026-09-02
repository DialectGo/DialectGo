/**
 * ocr.service.js
 * ---------------
 * Node.js integration service for the DialectGo PaddleOCR FastAPI
 * microservice running on Google Cloud Run.
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const OCR_BASE_URL = (
    process.env.PADDLE_OCR_URL ||
    'http://localhost:8001'
).replace(/\/+$/, '');

const OCR_TIMEOUT = 120000; // 120 seconds


/**
 * Extract text from a base64-encoded image.
 *
 * @param {string} base64Image
 * @returns {Promise<object>}
 */
export const extractTextFromBase64 = async (base64Image) => {
    try {
        console.log(
            '[OCR Service] Base64 request →',
            `${OCR_BASE_URL}/extract-text-base64`
        );

        const response = await axios.post(
            `${OCR_BASE_URL}/extract-text-base64`,
            {
                image: base64Image
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: OCR_TIMEOUT
            }
        );

        console.log(
            '[OCR Service] Base64 response status:',
            response.status
        );

        console.log(
            '[OCR Service] Base64 response success:',
            response.data?.success
        );

        if (response.data?.success) {
            return {
                text: response.data.full_text || '',
                details: response.data.details || [],
                layoutHints: response.data.layout_hints || null,
            };
        }

        throw new Error(
            'PaddleOCR returned an unsuccessful response.'
        );

    } catch (error) {

        console.error(
            '[OCR Service] extractTextFromBase64 error'
        );

        console.error(
            'Message:',
            error.message
        );

        console.error(
            'Code:',
            error.code
        );

        console.error(
            'Status:',
            error.response?.status
        );

        console.error(
            'Response:',
            error.response?.data
        );

        if (
            error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND'
        ) {
            throw new Error(
                `PaddleOCR microservice is not reachable at ${OCR_BASE_URL}.`
            );
        }

        if (error.code === 'ECONNABORTED') {
            throw new Error(
                `PaddleOCR request timed out after ${OCR_TIMEOUT / 1000} seconds.`
            );
        }

        const detail =
            error.response?.data?.detail ||
            error.response?.data?.error ||
            error.message;

        throw new Error(
            `OCR extraction failed: ${detail}`
        );
    }
};


/**
 * Extract text from an image file.
 *
 * @param {string} filePath
 * @returns {Promise<object>}
 */
export const extractTextFromFile = async (filePath) => {

    console.log(
        '[OCR Service] extractTextFromFile called'
    );

    console.log(
        '[OCR Service] File path:',
        filePath
    );

    console.log(
        '[OCR Service] OCR URL:',
        OCR_BASE_URL
    );

    if (!filePath) {
        throw new Error(
            'OCR: No image file path was provided.'
        );
    }

    if (!fs.existsSync(filePath)) {
        throw new Error(
            `OCR: Image file not found at path: ${filePath}`
        );
    }

    try {

        const form = new FormData();

        form.append(
            'file',
            fs.createReadStream(filePath)
        );

        const headers = form.getHeaders();

        console.log(
            '[OCR Service] Sending multipart request...'
        );

        console.log(
            '[OCR Service] Endpoint:',
            `${OCR_BASE_URL}/extract-text`
        );

        const response = await axios.post(
            `${OCR_BASE_URL}/extract-text`,
            form,
            {
                headers: {
                    ...headers
                },

                timeout: OCR_TIMEOUT,

                maxContentLength: Infinity,
                maxBodyLength: Infinity,

                // Keep the connection alive.
                httpAgent: undefined,

                validateStatus: (status) => {
                    return status >= 200 && status < 300;
                }
            }
        );

        console.log(
            '[OCR Service] OCR response received.'
        );

        console.log(
            '[OCR Service] Response status:',
            response.status
        );

        console.log(
            '[OCR Service] Response data:',
            JSON.stringify(response.data)
        );

        if (response.data?.success) {

            return {
                text: response.data.full_text || '',
                details: response.data.details || [],
                layoutHints: response.data.layout_hints || null,
            };
        }

        throw new Error(
            'PaddleOCR returned an unsuccessful response.'
        );

    } catch (error) {

        console.error(
            '[OCR Service] extractTextFromFile FAILED'
        );

        console.error(
            '[OCR Service] Message:',
            error.message
        );

        console.error(
            '[OCR Service] Code:',
            error.code
        );

        console.error(
            '[OCR Service] Status:',
            error.response?.status
        );

        console.error(
            '[OCR Service] Response:',
            error.response?.data
        );

        console.error(
            '[OCR Service] URL:',
            `${OCR_BASE_URL}/extract-text`
        );

        if (
            error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND'
        ) {
            throw new Error(
                `PaddleOCR microservice is not reachable at ${OCR_BASE_URL}.`
            );
        }

        if (error.code === 'ETIMEDOUT') {
            throw new Error(
                'Connection to PaddleOCR timed out.'
            );
        }

        if (error.code === 'ECONNABORTED') {
            throw new Error(
                `PaddleOCR request timed out after ${OCR_TIMEOUT / 1000} seconds.`
            );
        }

        const detail =
            error.response?.data?.detail ||
            error.response?.data?.error ||
            error.message;

        throw new Error(
            `OCR extraction failed: ${detail}`
        );
    }
};