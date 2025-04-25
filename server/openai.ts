import { Request, Response } from 'express';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Interface for OpenAI chat API options
interface OpenAIRequestOptions {
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

// Function to call the OpenAI API
export async function callOpenAIAPI(options: OpenAIRequestOptions) {
  try {
    console.log('Calling OpenAI API with options:', JSON.stringify({
      ...options,
      // Don't log full message content for privacy
      messages: options.messages.map(m => ({ role: m.role, content_length: m.content.length }))
    }));
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: options.messages,
      max_tokens: options.max_tokens || 300,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0
    });

    console.log('OpenAI API success - response:', response.choices.length + ' choices received');
    
    return {
      choices: response.choices.map(choice => ({
        message: {
          role: choice.message.role,
          content: choice.message.content
        },
        finish_reason: choice.finish_reason
      })),
      id: response.id,
      model: response.model,
      object: 'chat.completion',
      usage: response.usage
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
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

    try {
      const response = await callOpenAIAPI({
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 300
      });
      
      return res.json(response);
    } catch (apiError) {
      console.error('API call failed, using fallback response:', apiError);
      
      // Create a fallback response
      const fallbackResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: `I apologize, but I'm having trouble connecting to my knowledge base at the moment. For ATLAS workspace bookings, you can use the calendar on the workspaces page to check availability and make reservations. If you have any other questions, please try again later or contact support.`
            },
            finish_reason: 'stop'
          }
        ],
        id: 'fallback-response',
        model: 'fallback-model',
        object: 'chat.completion',
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
      
      return res.json(fallbackResponse);
    }
  } catch (error) {
    console.error('Chat request error:', error);
    return res.status(500).json({ error: 'Failed to get chat response' });
  }
}