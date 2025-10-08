// services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

// System prompt for car rental assistant
const SYSTEM_PROMPT = `You are a helpful and friendly car rental assistant. Your role is to:
1. Help customers find the right vehicle for their needs
2. Explain pricing, policies, and rental terms clearly
3. Guide users through the booking process
4. Answer questions about vehicle features and availability
5. Be concise, friendly, and professional

Key information:
- We offer various car types: economy, sedan, SUV, luxury vehicles
- Pricing varies based on vehicle type and rental duration
- We accept all major payment methods
- Insurance options are available
- 24/7 customer support is provided
- Valid driver's license and ID are required

Keep responses brief (2-3 sentences) unless detailed explanation is requested.`;

// OpenAI Implementation
const getOpenAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const systemMessage = {
      role: 'system',
      content: SYSTEM_PROMPT
    };

    // Get last 10 messages for context
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
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }

    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    throw error;
  }
};

// Gemini Implementation
const getGeminiResponse = async (userMessage, conversationHistory = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    });

    // Build conversation context
    const recentHistory = conversationHistory.slice(-10);
    let contextMessages = recentHistory
      .map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `${SYSTEM_PROMPT}

${contextMessages ? `Previous conversation:\n${contextMessages}\n` : ''}
Customer: ${userMessage}
Assistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini');
    }

    return text.trim();

  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
};

// Fallback response for when AI services are unavailable
const getFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "Our rental prices vary based on vehicle type and duration. Economy cars start from ₹1,500/day. For specific pricing, please browse our vehicle catalog or contact our support team at support@carrental.com.";
  }
  
  if (lowerMessage.includes('book') || lowerMessage.includes('rent')) {
    return "To book a car: 1) Browse available vehicles, 2) Select your desired car and dates, 3) Complete the booking form with your details, 4) Make payment. Need help? Contact us at support@carrental.com.";
  }
  
  if (lowerMessage.includes('policy') || lowerMessage.includes('term')) {
    return "Key rental policies: Valid driver's license required, minimum age 21, fuel policy is full-to-full, late returns incur additional charges. For complete terms, visit our policies page or contact support@carrental.com.";
  }
  
  if (lowerMessage.includes('insurance')) {
    return "We offer comprehensive insurance coverage for all rentals. Basic insurance is included, with premium options available for additional protection. Details provided during booking.";
  }
  
  if (lowerMessage.includes('payment')) {
    return "We accept all major credit/debit cards, UPI, and digital wallets. Payment is required at the time of booking. Secure payment processing guaranteed.";
  }

  return "I'm currently experiencing connectivity issues. For immediate assistance, please contact our support team at support@carrental.com or call our helpline. We're here to help!";
};

// Main export with comprehensive error handling and fallbacks
export const getAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    console.log(`🤖 Using AI Provider: ${AI_PROVIDER}`);

    // Try primary provider
    if (AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
      try {
        return await getOpenAIResponse(userMessage, conversationHistory);
      } catch (error) {
        console.error('OpenAI failed, trying fallback...', error.message);
        // Try Gemini as fallback
        if (process.env.GEMINI_API_KEY) {
          console.log('⚠️ Falling back to Gemini');
          return await getGeminiResponse(userMessage, conversationHistory);
        }
      }
    } 
    
    if (AI_PROVIDER === 'gemini' && process.env.GEMINI_API_KEY) {
      try {
        return await getGeminiResponse(userMessage, conversationHistory);
      } catch (error) {
        console.error('Gemini failed, trying fallback...', error.message);
        // Try OpenAI as fallback
        if (process.env.OPENAI_API_KEY) {
          console.log('⚠️ Falling back to OpenAI');
          return await getOpenAIResponse(userMessage, conversationHistory);
        }
      }
    }

    // Try any available provider if primary failed
    if (process.env.OPENAI_API_KEY && AI_PROVIDER !== 'openai') {
      console.log('⚠️ Attempting OpenAI as backup');
      try {
        return await getOpenAIResponse(userMessage, conversationHistory);
      } catch (error) {
        console.error('OpenAI backup failed:', error.message);
      }
    }

    if (process.env.GEMINI_API_KEY && AI_PROVIDER !== 'gemini') {
      console.log('⚠️ Attempting Gemini as backup');
      try {
        return await getGeminiResponse(userMessage, conversationHistory);
      } catch (error) {
        console.error('Gemini backup failed:', error.message);
      }
    }

    // All AI providers failed, use fallback
    console.warn('⚠️ All AI providers failed, using fallback responses');
    return getFallbackResponse(userMessage);

  } catch (error) {
    console.error('AI Service Critical Error:', error);
    return getFallbackResponse(userMessage);
  }
};

// Validate AI configuration on startup
export const validateAIConfig = () => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  console.log('\n🔍 AI Configuration Status:');
  console.log(`- OpenAI: ${hasOpenAI ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`- Gemini: ${hasGemini ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`- Primary Provider: ${AI_PROVIDER}`);

  if (!hasOpenAI && !hasGemini) {
    console.warn('⚠️ WARNING: No AI providers configured. Chatbot will use fallback responses only.');
    console.warn('Please set OPENAI_API_KEY or GEMINI_API_KEY in your .env file.');
  }

  return hasOpenAI || hasGemini;
};