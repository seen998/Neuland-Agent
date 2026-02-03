import { useState, useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { sessionApi, chatApi } from './utils/api';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatContainer } from './components/chat/ChatContainer';
import './index.css';

function App() {
  const {
    setSession,
    clearSession,
    setAvailableModels,
    setSelectedModel,
    setMessages
  } = useAppStore();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedSessionId = localStorage.getItem('ai-coaching-storage')
        ? JSON.parse(localStorage.getItem('ai-coaching-storage') || '{}').state?.sessionId
        : null;

      if (storedSessionId) {
        try {
          const response = await sessionApi.get(storedSessionId);
          if (response.success && response.data) {
            setSession(response.data);

            // Load messages for the current tab immediately
            try {
              const historyResponse = await chatApi.getHistory(storedSessionId, response.data.currentTab);
              if (historyResponse.success && historyResponse.data) {
                setMessages(historyResponse.data.messages);
              }
            } catch (historyError) {
              console.error('Error loading history:', historyError);
            }
          } else {
            // Session expired or invalid
            clearSession();
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error('Error restoring session:', error);
          clearSession();
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(true);
      }

      setIsLoading(false);
    };

    // Load available models
    fetch('/api/config/models')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setAvailableModels(data.data);
          if (data.data.length > 0) {
            setSelectedModel(data.data[0].id);
          }
        }
      })
      .catch(console.error);

    checkSession();
  }, [setSession, clearSession, setAvailableModels, setSelectedModel]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full spinner mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
}

export default App;
