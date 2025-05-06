import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Extract text from a PDF file using pdf.js
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractFromPDF(file: File): Promise<string> {
  try {
    console.log(`[PDF] Starting extraction for: ${file.name}`);
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`[PDF] Loaded ${pdf.numPages} pages.`);

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => ('str' in item ? item.str : ''))
        .join(' ');

      fullText += pageText + '\n\n';
      console.log(`[PDF] Extracted text from page ${i}`);
    }

    return fullText.trim();
  } catch (error) {
    console.error(`[PDF] Failed extraction for: ${file.name}`, error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from a Word document (.docx) using mammoth
 * @param file The Word document to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractFromWord(file: File): Promise<string> {
  try {
    console.log(`[Word] Starting extraction for: ${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log(`[Word] Extraction successful for: ${file.name}`);
    return result.value;
  } catch (error) {
    console.error(`[Word] Failed extraction for: ${file.name}`, error);
    throw new Error(`Failed to extract text from Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from an image using Tesseract.js (OCR)
 * @param file The image file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractFromImage(file: File): Promise<string> {
  let worker: Tesseract.Worker | null = null;
  let imageUrl: string | null = null;

  try {
    console.log(`[Image OCR] Starting extraction for: ${file.name}`);
    worker = await Tesseract.createWorker('eng');

    imageUrl = URL.createObjectURL(file);
    console.log('[Image OCR] Recognizing text...');
    const { data: { text, confidence } } = await worker.recognize(imageUrl);
    console.log(`[Image OCR] Recognition complete for ${file.name}. Confidence: ${confidence}`);

    return text;
  } catch (error) {
    console.error(`[Image OCR] Failed extraction for: ${file.name}`, error);
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    if (worker) {
      await worker.terminate();
    }
  }
}

/**
 * Extract text from a file based on its type
 * @param file The file to extract text from
 * @returns A promise that resolves to the extracted text with file type prefix
 */
export async function extractText(file: File): Promise<string> {
  try {
    let text = '';
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      text = await extractFromPDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               fileName.endsWith('.docx')) {
      text = await extractFromWord(file);
    } else if (fileType.startsWith('image/')) {
      text = await extractFromImage(file);
    } else {
      throw new Error('Unsupported file type');
    }

    // Add file type prefix for context
    const prefix = `[DOCUMENT:${file.name}]\n\n`;
    return prefix + text;
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw error;
  }
}