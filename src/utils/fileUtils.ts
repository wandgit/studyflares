/**
 * Utility functions for handling file uploads and text extraction
 */

/**
 * Read a file and return its contents as text
 * @param file The file to read
 * @returns A promise that resolves to the file's contents as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Read a file as a base64 encoded string
 * @param file The file to read
 * @returns A promise that resolves to the file's contents as a base64 string
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        // Get the base64 string by removing the data URL prefix
        const base64String = (event.target.result as string).split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Extract text content from a file based on its type
 * @param file The file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  // Handle plain text files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await readFileAsText(file);
  }
  
  // For document files (PDF, Word, etc.), use the browser-based extraction service
  if (fileType === 'application/pdf' || 
      fileName.endsWith('.pdf') ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')) {
    
    try {
      // Import the text extraction service dynamically
      const { extractText } = await import('../services/textExtractionService');
      return await extractText(file);
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error(`Failed to extract text from ${file.name}: ${error.message}`);
    }
  }
  
  // For unsupported file types
  throw new Error(`Unsupported file type: ${fileType}. Please upload a text, PDF, or Word document.`);
};

/**
 * Get a preview of the text content (first 200 characters)
 * @param text The text to preview
 * @returns A preview of the text
 */
export const getTextPreview = (text: string): string => {
  // If this is a PDF document marker, return a friendly message
  if (text.startsWith('[PDF_DOCUMENT:')) {
    const filename = text.match(/\[PDF_DOCUMENT:(.*?)\]/)?.[1] || 'document.pdf';
    return `PDF document uploaded: ${filename}. Content will be processed by Gemini AI.`;
  }
  
  if (text.length <= 200) {
    return text;
  }
  
  return text.substring(0, 200) + '...';
};
