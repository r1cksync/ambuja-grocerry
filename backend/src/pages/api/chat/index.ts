import type { NextApiRequest, NextApiResponse } from 'next';
import { getChatCompletion, ChatMessage } from '@/lib/groq';
import { handleCors } from '@/lib/cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chatHistory: ChatMessage[] = history.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await getChatCompletion(chatHistory, message);

    res.status(200).json({
      message: response,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to get response' });
  }
}
