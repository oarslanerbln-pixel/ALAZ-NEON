import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(file: File): Promise<string> {
  const worker = await createWorker('tur');
  try {
    const { data } = await worker.recognize(file);
    return data.text.trim();
  } finally {
    await worker.terminate();
  }
}
