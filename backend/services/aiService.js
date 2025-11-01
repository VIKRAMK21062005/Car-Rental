// backend/services/aiService.js - ENHANCED WITH KIMI K2
import dotenv from 'dotenv';
dotenv.config();

// ✅ FIX: Enhanced system prompt for car rental
const SYSTEM_PROMPT = `You are an intelligent and helpful car rental assistant for a premium car rental service. 

Your key responsibilities:
1. Help customers find the perfect vehicle based on their needs (budget, passenger count, trip duration, preferences)
2. Explain pricing clearly - base rates, discounts, insurance, additional fees
3. Guide users through the booking process step-by-step
4. Answer questions about vehicle features, availability, and rental policies
5. Help with coupon codes and special offers
6. Provide information about pickup/dropoff procedures
7. Assist with booking modifications and cancellations
8. Handle customer concerns professionally

Available vehicle types:
- Economy: Budget-friendly, fuel-efficient, perfect for city driving (₹1500-2000/day)
- Sedan: Comfortable mid-size, ideal for families (₹2500-3500/day)
- SUV: Spacious, perfect for groups and long trips (₹4000-6000/day)
- Luxury: Premium vehicles with advanced features (₹8000-15000/day)
- Sports: High-performance cars for special occasions (₹10000-20000/day)

Key policies:
- Valid driver's license required (minimum age 21)
- Security deposit: ₹5000-10000 (refundable)
- Fuel policy: Full-to-full (return with same fuel level)
- Late returns: ₹500/hour penalty
- Insurance: Basic included, comprehensive available
- Payment: Credit/debit cards, UPI, digital wallets accepted
- Cancellation: Free up to 24 hours before pickup, 50% refund after

Important instructions:
- Be conversational, friendly, and helpful
- Ask clarifying questions to understand customer needs
- Provide specific examples and recommendations
- Keep responses concise but informative (2-4 sentences)
- If you don't know something specific, admit it and offer to connect them with support
- Always mention booking can be done through the website
- Suggest relevant coupons when discussing pricing
- Use emojis sparingly for a friendly tone

Remember: You're here to make car rental easy and stress-free for customers!`;

// ✅ FIX: Kimi K2 Implementation using OpenRouter
const getKimiResponse = async (userMessage, conversationHistory = []) => {
  try {
    const KIMI_API_KEY = process.env.KIMI_API_KEY;
    const KIMI_API_URL = process.env.KIMI_API_URL || 'https://openrouter.ai/api/v1';

    if (!KIMI_API_KEY) {
      throw new Error('KIMI_API_KEY not configured');
    }

    // Build messages array
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ];

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log('🤖 Sending request to Kimi K2...');

    const response = await fetch(`${KIMI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'HTTP-Referer': 'https://your-car-rental-site.com',
        'X-Title': 'Car Rental Chatbot'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // Using OpenRouter, you can use various models
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Kimi K2 API Error:', errorData);
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Kimi K2');
    }

    const aiResponse = data.choices[0].message.content.trim();
    console.log('✅ Kimi K2 response received');

    return aiResponse;

  } catch (error) {
    console.error('Kimi K2 Error:', error.message);
    throw error;
  }
};

// ✅ FIX: Fallback response with better context awareness
const getFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();

  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good evening)/i)) {
    return "Hello! 👋 Welcome to our car rental service! I'm here to help you find the perfect vehicle. What type of car are you looking for, or would you like to know about our current offers?";
  }

  // Pricing queries
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
    return "Our rental rates vary by vehicle type:\n• Economy: ₹1500-2000/day\n• Sedan: ₹2500-3500/day\n• SUV: ₹4000-6000/day\n• Luxury: ₹8000-15000/day\n\nWe also have special weekend discounts and weekly packages! Would you like to see available vehicles in a specific category?";
  }
  
  // Booking queries
  if (lowerMessage.includes('book') || lowerMessage.includes('rent') || lowerMessage.includes('reserve')) {
    return "Booking with us is easy! 🚗\n\n1. Browse our vehicles on the website\n2. Select your desired car and rental dates\n3. Complete the booking form\n4. Make secure payment\n\nYou can start browsing available cars right now! Need help choosing the right vehicle for your needs?";
  }
  
  // Policy queries
  if (lowerMessage.includes('policy') || lowerMessage.includes('rule') || lowerMessage.includes('requirement')) {
    return "Our key rental policies:\n\n✓ Valid driver's license required (min. age 21)\n✓ Security deposit: ₹5000-10000 (refundable)\n✓ Fuel policy: Full-to-full\n✓ Free cancellation up to 24 hours before pickup\n✓ Late return: ₹500/hour\n\nNeed more details about any specific policy?";
  }
  
  // Insurance queries
  if (lowerMessage.includes('insurance') || lowerMessage.includes('coverage')) {
    return "We offer comprehensive insurance options:\n\n• Basic insurance included in all rentals\n• Comprehensive coverage available (₹500-1000/day)\n• Covers accidents, theft, and third-party liability\n• Zero-depreciation option available\n\nWould you like to add insurance to your booking?";
  }
  
  // Payment queries
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
    return "We accept multiple payment methods:\n\n💳 Credit/Debit cards (Visa, Mastercard, Amex)\n📱 UPI (Google Pay, PhonePe, Paytm)\n💰 Digital Wallets\n\nAll payments are 100% secure and encrypted. Payment is required at booking confirmation.";
  }

  // Coupon queries
  if (lowerMessage.includes('coupon') || lowerMessage.includes('discount') || lowerMessage.includes('offer') || lowerMessage.includes('promo')) {
    return "Great news! We have active discount coupons available! 🎉\n\nCheck our homepage for current offers - you'll find coupon codes you can apply during checkout to save money on your rental. Would you like to know about our vehicles or proceed with browsing?";
  }

  // Vehicle type queries
  if (lowerMessage.includes('suv') || lowerMessage.includes('sedan') || lowerMessage.includes('luxury') || lowerMessage.includes('economy')) {
    const type = lowerMessage.match(/(suv|sedan|luxury|economy|sports)/i)?.[0] || 'vehicle';
    return `We have excellent ${type} options available! Our ${type}s are well-maintained and perfect for your needs. You can browse all available ${type}s on our cars page. Would you like recommendations based on your specific requirements (budget, passengers, trip duration)?`;
  }

  // Contact/support
  if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('talk to')) {
    return "I'm here to help! 😊 You can also reach our support team:\n\n📧 Email: support@carrental.com\n📞 Phone: +91 1234567890\n⏰ Available: 24/7\n\nWhat would you like help with - booking, pricing, or vehicle information?";
  }

  // Documents
  if (lowerMessage.includes('document') || lowerMessage.includes('license') || lowerMessage.includes('id')) {
    return "For car rental, you'll need:\n\n✓ Valid driver's license\n✓ Government-issued ID (Aadhar/Passport)\n✓ Proof of address\n\nThese documents will be verified at pickup. Do you have any other questions about the rental process?";
  }

  // Cancellation
  if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
    return "Our cancellation policy:\n\n✓ Free cancellation up to 24 hours before pickup\n✓ 50% refund for cancellations within 24 hours\n✓ Refunds processed in 5-7 business days\n\nNeed to cancel an existing booking? Please visit your bookings page.";
  }

  // General fallback
  return "I'm here to help you with car rentals! 🚗 I can assist you with:\n\n• Finding the perfect car for your needs\n• Pricing and discounts\n• Booking process and requirements\n• Rental policies and insurance\n• Payment options\n\nWhat would you like to know more about?";
};

// Main export with comprehensive error handling
export const getAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    console.log(`🤖 Processing message: "${userMessage}"`);

    // Try Kimi K2 first
    try {
      const response = await getKimiResponse(userMessage, conversationHistory);
      return response;
    } catch (error) {
      console.error('❌ Kimi K2 failed, using fallback:', error.message);
      return getFallbackResponse(userMessage);
    }

  } catch (error) {
    console.error('❌ AI Service Critical Error:', error);
    return getFallbackResponse(userMessage);
  }
};

// Validate AI configuration
export const validateAIConfig = () => {
  const hasKimi = !!process.env.KIMI_API_KEY;

  console.log('\n🔍 AI Configuration Status:');
  console.log(`- Kimi K2 API: ${hasKimi ? '✅ Configured' : '❌ Not configured'}`);

  if (!hasKimi) {
    console.warn('⚠️ WARNING: Kimi K2 API not configured. Chatbot will use fallback responses only.');
    console.warn('Please set KIMI_API_KEY in your .env file.');
  }

  return hasKimi;
};