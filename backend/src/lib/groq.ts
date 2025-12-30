import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful shopping assistant for Ambuja Neotia Grocery, an exclusive grocery delivery service for Ambuja Neotia employees. 

Your responsibilities include:
- Helping users find products
- Answering questions about product availability, pricing, and features
- Assisting with order-related queries
- Providing recipe suggestions based on available products
- Helping with dietary recommendations

Be friendly, concise, and helpful. If you don't know something specific about inventory or orders, suggest the user check the relevant section of the app or contact customer support.

Always maintain a professional yet friendly tone, and remember you're serving valued employees of Ambuja Neotia.`;

export async function getChatCompletion(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const allMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
    { role: 'user', content: userMessage },
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages: allMessages,
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function getProductRecommendations(
  query: string,
  availableProducts: string[]
): Promise<string> {
  const prompt = `Based on the user's query: "${query}"
  
Available products: ${availableProducts.join(', ')}

Suggest the most relevant products from the available list and explain why they might be helpful. Keep the response concise and helpful.`;

  return getChatCompletion([], prompt);
}

export async function getRecipeSuggestion(ingredients: string[]): Promise<string> {
  const prompt = `Suggest a simple recipe using these ingredients: ${ingredients.join(', ')}. 
  
Provide a brief recipe with:
1. Recipe name
2. Cooking time
3. Simple step-by-step instructions
4. Any additional common ingredients that might be needed

Keep it concise and practical for home cooking.`;

  return getChatCompletion([], prompt);
}

export { groq };
