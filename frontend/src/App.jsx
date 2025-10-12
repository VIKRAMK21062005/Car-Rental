import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import AppRouter from './router';
import ChatbotWidget from './components/common/ChatbotWidget';
import './assets/styles/tailwind.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <AppRouter />
              <ChatbotWidget />
            </div>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;