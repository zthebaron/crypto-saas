export function extractText(buffer: Buffer, mimeType: string): string {
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    return buffer.toString('utf-8');
  }

  if (mimeType === 'application/pdf') {
    // pdf-parse is optional — gracefully degrade if not installed
    try {
      const pdfParse = require('pdf-parse');
      // pdf-parse returns a promise, but we handle it in the route
      return '__PDF_ASYNC__';
    } catch {
      return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    }
  }

  // Default: try to read as text
  return buffer.toString('utf-8');
}

export async function extractTextAsync(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text;
    } catch {
      return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    }
  }

  return buffer.toString('utf-8');
}
