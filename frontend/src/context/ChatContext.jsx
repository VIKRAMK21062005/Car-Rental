import { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addMessage = (message) => {
    setMessages(prev => [...prev, { ...message, id: Date.now() }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <ChatContext.Provider value={{ messages, isOpen, addMessage, clearMessages, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
};