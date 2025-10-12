// useChatbot Hook - frontend/src/hooks/useChatbot.js
import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

export const useChatbot = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatProvider');
  }
  return context;
};