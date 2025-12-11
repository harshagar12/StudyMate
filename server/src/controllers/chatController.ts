import { Response } from 'express';

import { AuthenticatedRequest } from '../middleware/auth';
import { generateEmbedding } from '../utils/rag';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithRetry = async (prompt: any, retries = 3): Promise<string> => {
  for (let i = 0; i < retries; i++) {
    try {
      // Use newest flash model which might have fresher quota or less usage
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); 
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      if (error.status === 429 || error.message?.includes('429')) {
        console.log(`Rate limited (429). Retrying attempt ${i + 1}/${retries}...`);
        if (i === retries - 1) throw error; // Throw on last attempt
        
        // Wait for 2s, 4s, 8s...
        const waitTime = 2000 * Math.pow(2, i);
        await delay(waitTime);
        continue;
      }
      throw error; // Throw other errors immediately
    }
  }
  throw new Error('Retries failed');
};

export const chat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { message, subjectId } = req.body;

    if (!message || !subjectId) {
       res.status(400).json({ error: 'Message and Subject ID required' });
       return;
    }

    // 1. Generate Embedding for Query
    const queryEmbedding = await generateEmbedding(message);

    // 2. Similarity Search using Database RPC
    const { data: documents, error: searchError } = await req.supabase!
      .rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5, // Adjust based on testing
        match_count: 5,
        filter_subject_id: subjectId
      });

    if (searchError) throw searchError;

    // 3. Construct Prompt
    const context = documents?.map((doc: any) => doc.content).join('\n\n') || '';
    
    const systemPrompt = `You are a helpful study assistant. Use the following context from the user's study materials to answer their question. 
    If the answer is not in the context, say "I couldn't find the answer in your notes, but here is what I know generally:" and then answer from your general knowledge.
    Always cite the source concept if possible.
    
    Context:
    ${context}
    `;

    // 4. Generate Response with Retry
    const text = await generateWithRetry([systemPrompt, message]);

    console.log('Chat response generated successfully.');
    res.status(200).json({ answer: text, sources: documents });

  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(400).json({ error: error.message });
  }
};
