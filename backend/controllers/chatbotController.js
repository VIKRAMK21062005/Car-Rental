import express from 'express';
import {
  sendMessage,
  getConversation,
  clearConversation,
  getSuggestions
} from '../controllers/chatbotController.js';

const router = express.Router();

// Chatbot routes
router.post('/send', sendMessage);                // Send user message and get AI response
router.get('/conversation/:conversationId', getConversation);  // Retrieve a conversation
router.delete('/conversation/:conversationId', clearConversation); // Clear conversation
router.get('/suggestions', getSuggestions);       // Get chatbot suggestion list

export default router;
