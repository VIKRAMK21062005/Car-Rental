import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

// OpenAI Implementation
const getOpenAIResponse = async (userMessage, conversationHistory = []) => {
  const systemMessage = {
    role: 'system',
    content: `You are a helpful car rental assistant. Help customers with vehicle information, pricing, bookings, and policies. Be friendly and concise.`
  };

  const recentHistory = conversationHistory.slice(-10);
  const messages = [
    systemMessage,
    ...recentHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenAI API request failed');
  }

  return data.choices[0].message.content;
};

// Gemini Implementation
const getGeminiResponse = async (userMessage, conversationHistory = []) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

  const systemContext = `You are a helpful car rental assistant. Answer questions about rentals, pricing, and policies.`;

  const recentHistory = conversationHistory.slice(-5);
  let contextMessages = recentHistory
    .map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `${systemContext}\n\nPrevious conversation:\n${contextMessages}\n\nCustomer: ${userMessage}\nAssistant:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

// Main export with fallback
export const getAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    console.log(`🤖 Using AI Provider: ${AI_PROVIDER}`);

    if (AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
      return await getOpenAIResponse(userMessage, conversationHistory);
    } else if (AI_PROVIDER === 'gemini' && process.env.GEMINI_API_KEY) {
      return await getGeminiResponse(userMessage, conversationHistory);
    } else {
      // Fallback logic
      if (process.env.OPENAI_API_KEY) {
        console.log('⚠️  Falling back to OpenAI');
        return await getOpenAIResponse(userMessage, conversationHistory);
      } else if (process.env.GEMINI_API_KEY) {
        console.log('⚠️  Falling back to Gemini');
        return await getGeminiResponse(userMessage, conversationHistory);
      } else {
        throw new Error('No AI provider configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in .env');
      }
    }

  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
};