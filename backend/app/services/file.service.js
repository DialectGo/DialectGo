import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { extractTextFromFile } from './ocr.service.js';

/**
 * Extracts text from a document or image file.
 * @param {string} filePath - Path to the uploaded file.
 * @param {string} mimeType - The mimetype of the uploaded file.
 * @returns {Promise<{text: string, ocrDetails: Array|null, layoutHints: Object|null}>} - Extracted text and optional OCR metadata.
 */
export const extractTextFromFilepath = async (filePath, mimeType) => {
    if (!fs.existsSync(filePath)) {
        throw new Error('File not found for processing.');
    }

    try {
        if (mimeType === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return { text: data.text || '', ocrDetails: null, layoutHints: null };
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword' || 
            filePath.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ path: filePath });
            return { text: result.value || '', ocrDetails: null, layoutHints: null };
        } else if (mimeType.startsWith('image/')) {
            // Use the PaddleOCR microservice for images — returns spatial data
            const ocrResult = await extractTextFromFile(filePath);
            return {
                text: ocrResult.text,
                ocrDetails: ocrResult.details || null,
                layoutHints: ocrResult.layoutHints || null,
            };
        } else {
            throw new Error(`Unsupported file format: ${mimeType}`);
        }
    } catch (err) {
        console.error('[file.service] Extract Error:', err);
        throw new Error(`Failed to extract text: ${err.message}`);
    }
};

/**
 * Generates a PDF buffer from a text string.
 * @param {string} text - The translated text.
 * @returns {Promise<Buffer>}
 */
export const generatePdfFromText = (text) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            
            doc.fontSize(18).text('DialectGo Translation Result', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(text, {
                align: 'left',
                lineGap: 4
            });
            
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Generates a DOCX buffer from a text string.
 * @param {string} text - The translated text.
 * @returns {Promise<Buffer>}
 */
export const generateDocxFromText = async (text) => {
    try {
        // Split text by newlines into separate paragraphs
        const paragraphs = text.split('\n').map(line => {
            return new Paragraph({
                children: [
                    new TextRun(line)
                ]
            });
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "DialectGo Translation Result", bold: true, size: 28 })
                        ],
                        spacing: { after: 300 }
                    }),
                    ...paragraphs
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        return buffer;
    } catch (err) {
        throw new Error(`DOCX Generation failed: ${err.message}`);
    }
};
