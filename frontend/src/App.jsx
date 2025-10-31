// frontend/src/App.jsx - PERFECT VERSION
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthProvider.jsx';
import ThemeProvider from './context/ThemeProvider.jsx';
import ChatProvider from './context/ChatProvider.jsx';
import AppRouter from './router';
import ChatbotWidget from './components/common/ChatbotWidget';



function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
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