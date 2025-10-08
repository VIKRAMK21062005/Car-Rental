// routes/chatbotRoutes.js
import express from 'express';
import {
  sendMessage,
  getConversation,
  clearConversation,
  getSuggestions
} from '../controllers/chatbotController.js';

const router = express.Router();

// Chatbot routes
router.post('/send', sendMessage);
router.get('/conversation/:conversationId', getConversation);
router.delete('/conversation/:conversationId', clearConversation);
router.get('/suggestions', getSuggestions);

export default router;