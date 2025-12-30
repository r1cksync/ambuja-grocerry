import type { NextApiRequest, NextApiResponse } from 'next';
import { getRecipeSuggestion } from '@/lib/groq';
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
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    const recipe = await getRecipeSuggestion(ingredients);

    res.status(200).json({
      recipe,
    });
  } catch (error: any) {
    console.error('Recipe suggestion error:', error);
    res.status(500).json({ error: error.message || 'Failed to get recipe suggestion' });
  }
}
