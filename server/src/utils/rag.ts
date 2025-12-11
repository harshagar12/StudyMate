import { GoogleGenerativeAI } from '@google/generative-ai';
const pdfParse = require('pdf-parse');
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

const { PDFParse } = require('pdf-parse');

export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  console.log('Attempting to parse PDF using class-based PDFParse, buffer size:', buffer.length);
  let parser = null;
  try {
      parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      console.log('PDF Parsed successfully, text length:', data.text?.length);
      return data.text || '';
  } catch (error: any) {
      console.error('Core PDF Parse logic failed:', error);
      throw error;
  } finally {
      if (parser) {
          await parser.destroy();
      }
  }
};

export const chunkText = (text: string, chunkSize: number = 1000): string[] => {
  const chunks: string[] = [];
  let currentChunk = '';

  const sentences = text.split(/(?<=[.?!])\s+/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  return chunks;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
};
