import { Request, Response } from 'express';

// Parameters for the Perplexity API
interface PerplexityRequestOptions {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// Function to call the Perplexity API
export async function callPerplexityAPI(options: PerplexityRequestOptions) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('Perplexity API key is not available');
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || 'llama-3.1-sonar-small-128k-online',
        messages: options.messages,
        max_tokens: options.max_tokens,
        temperature: options.temperature ?? 0.2,
        top_p: options.top_p ?? 0.9,
        frequency_penalty: options.frequency_penalty ?? 1,
        presence_penalty: options.presence_penalty ?? 0,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Perplexity API error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    throw error;
  }
}

// Middleware to handle chat requests
export async function handleChatRequest(req: Request, res: Response) {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Adding system message for the workspace assistant
    const formattedMessages = [
      {
        role: 'system' as const,
        content: 'You are ATLAS Assistant, a helpful AI for the ATLAS workspace booking application. Be concise, friendly, and focus on helping users with workspace bookings, account management, and general workspace questions. Limit responses to 3-4 sentences max.'
      },
      ...messages
    ];

    const response = await callPerplexityAPI({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: formattedMessages,
      temperature: 0.2,
      max_tokens: 300
    });

    return res.json(response);
  } catch (error) {
    console.error('Chat request error:', error);
    return res.status(500).json({ error: 'Failed to get chat response' });
  }
}