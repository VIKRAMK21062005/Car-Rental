// controllers/chatbotController.js
import { getAIResponse } from '../services/aiService.js';

// In-memory conversation storage (use Redis/DB in production)
const conversations = new Map();

// @desc    Send message and get AI response
// @route   POST /api/chatbot/send
// @access  Public
export const sendMessage = async (req, res) => {
  try {
    const { message, conversationId = 'default' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get or create conversation history
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, []);
    }
    const conversationHistory = conversations.get(conversationId);

    // Add user message to history
    conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Get AI response
    const aiResponse = await getAIResponse(message, conversationHistory);

    // Add AI response to history
    conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Keep only last 20 messages to prevent memory issues
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, conversationHistory.length - 20);
    }

    conversations.set(conversationId, conversationHistory);

    res.status(200).json({
      success: true,
      data: {
        message: aiResponse,
        conversationId,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Chatbot send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get conversation history
// @route   GET /api/chatbot/conversation/:conversationId
// @access  Public
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversationHistory = conversations.get(conversationId) || [];

    res.status(200).json({
      success: true,
      data: {
        conversationId,
        messages: conversationHistory,
        count: conversationHistory.length
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation'
    });
  }
};

// @desc    Clear conversation history
// @route   DELETE /api/chatbot/conversation/:conversationId
// @access  Public
export const clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (conversations.has(conversationId)) {
      conversations.delete(conversationId);
    }

    res.status(200).json({
      success: true,
      message: 'Conversation cleared successfully'
    });

  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear conversation'
    });
  }
};

// @desc    Get chatbot suggestions
// @route   GET /api/chatbot/suggestions
// @access  Public
export const getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      {
        id: 1,
        text: "What cars do you have available?",
        category: "general"
      },
      {
        id: 2,
        text: "How much does it cost to rent a car?",
        category: "pricing"
      },
      {
        id: 3,
        text: "What are your rental policies?",
        category: "policies"
      },
      {
        id: 4,
        text: "Do you offer insurance?",
        category: "services"
      },
      {
        id: 5,
        text: "How do I book a car?",
        category: "booking"
      },
      {
        id: 6,
        text: "What payment methods do you accept?",
        category: "payment"
      },
      {
        id: 7,
        text: "Can I extend my rental period?",
        category: "booking"
      },
      {
        id: 8,
        text: "What documents do I need?",
        category: "requirements"
      }
    ];

    res.status(200).json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve suggestions'
    });
  }
};