import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import AppRouter from './router';
import ChatbotWidget from './components/common/ChatbotWidget';
import DebugAuthStatus from './components/common/DebugAuthStatus';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <AppRouter />
              <ChatbotWidget />
              <DebugAuthStatus />
            </div>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;