import { useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../../stores/appStore';
import { chatApi, parseStreamEvent } from '../../utils/api';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Cpu, GitCompare, Trash2 } from 'lucide-react';

export function ChatContainer() {
  const {
    sessionId,
    currentTab,
    messages,
    addMessage,
    selectedModel,
    comparisonMode,
    comparisonModel,
    availableModels,
    setSelectedModel,
    setComparisonMode,
    setComparisonModel,
    isStreaming,
    setIsStreaming,
    streamingContent,
    setStreamingContent,
    appendStreamingContent,
    comparisonStreamingContent,
    setComparisonStreamingContent,
    appendComparisonStreamingContent,
    clearMessages,
    language
  } = useAppStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, comparisonStreamingContent]);

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;

    console.log('[Chat] Sending message:', content);

    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user' as const,
      content,
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    console.log('[Chat] Adding user message to store:', userMessage);
    addMessage(userMessage);

    // Start streaming
    setIsStreaming(true);
    setStreamingContent('');
    setComparisonStreamingContent('');

    // Local accumulators to avoid stale closure issues
    let fullContent = '';
    let fullComparisonContent = '';

    try {
      const response = await chatApi.sendMessage({
        sessionId,
        tabId: currentTab,
        message: content,
        model: selectedModel,
        comparisonMode,
        modelB: comparisonMode ? comparisonModel || undefined : undefined
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const event = parseStreamEvent(line);
          if (!event) continue;

          switch (event.type) {
            case 'content':
              // Update local var AND store
              fullContent += (event.content as string);
              appendStreamingContent(event.content as string);
              break;
            case 'comparisonContent':
              fullComparisonContent += (event.content as string);
              appendComparisonStreamingContent(event.content as string);
              break;
            case 'done':
              setIsStreaming(false);
              console.log('[Chat] Stream done. Final content length:', fullContent.length);

              // Add the streamed messages to the store using LOCAL variables
              if (fullContent) {
                addMessage({
                  id: uuidv4(),
                  role: 'assistant',
                  content: fullContent,
                  timestamp: new Date().toISOString(),
                  model: selectedModel
                });
              }
              if (comparisonMode && fullComparisonContent) {
                addMessage({
                  id: uuidv4(),
                  role: 'assistant',
                  content: fullComparisonContent,
                  timestamp: new Date().toISOString(),
                  model: comparisonModel || 'model-b'
                });
              }
              setStreamingContent('');
              setComparisonStreamingContent('');
              break;
            case 'error':
              console.error('Stream error:', event.error);
              setIsStreaming(false);
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);

      // Add error message
      addMessage({
        id: uuidv4(),
        role: 'assistant',
        content: language === 'en'
          ? 'Sorry, I encountered an error. Please try again.'
          : 'Entschuldigung, ich habe einen Fehler festgestellt. Bitte versuche es erneut.',
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleClearConversation = async () => {
    if (!sessionId) return;

    try {
      await chatApi.clearHistory(sessionId, currentTab);
      clearMessages();
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with Model Selection */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {currentTab === 'self-exploration'
              ? (language === 'en' ? 'Self Exploration | Personal Master' : 'Selbsterforschung | Persönlicher Meister')
              : (language === 'en' ? 'Multi Minds' : 'Multi Minds')
            }
          </h2>

          <div className="flex items-center gap-4">
            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isStreaming}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Conversation Button */}
            <button
              onClick={handleClearConversation}
              disabled={isStreaming || messages.length === 0}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={language === 'en' ? 'Clear conversation' : 'Gespräch löschen'}
            >
              <Trash2 className="w-4 h-4" />
              {language === 'en' ? 'Clear' : 'Löschen'}
            </button>

            {/* Comparison Mode Toggle */}
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              disabled={isStreaming}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${comparisonMode
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <GitCompare className="w-4 h-4" />
              {language === 'en' ? 'Compare' : 'Vergleich'}
            </button>

            {/* Second Model Selector (only in comparison mode) */}
            {comparisonMode && (
              <select
                value={comparisonModel || ''}
                onChange={(e) => setComparisonModel(e.target.value)}
                disabled={isStreaming}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
              >
                {availableModels
                  .filter((m) => m.id !== selectedModel)
                  .map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Cpu className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium">
              {language === 'en'
                ? 'Start your conversation'
                : 'Beginne dein Gespräch'}
            </p>
            <p className="text-sm">
              {language === 'en'
                ? 'The AI coach is ready to explore your personal vision'
                : 'Der AI-Coach ist bereit, deine persönliche Vision zu erkunden'}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // In comparison mode, show pairs of assistant messages
              if (comparisonMode && message.role === 'assistant') {
                const nextMessage = messages[index + 1];
                if (nextMessage?.role === 'assistant' && nextMessage.model !== message.model) {
                  return (
                    <div key={message.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-primary-600 mb-2">
                            {message.model?.split('/').pop()?.split(':')[0] || 'Model A'}
                          </div>
                          <ChatMessage message={message} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-primary-600 mb-2">
                            {nextMessage.model?.split('/').pop()?.split(':')[0] || 'Model B'}
                          </div>
                          <ChatMessage message={nextMessage} />
                        </div>
                      </div>
                    </div>
                  );
                }
                // Skip rendering if this is the second message of a pair
                if (index > 0 && messages[index - 1]?.role === 'assistant') {
                  return null;
                }
              }

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                  streamingContent={streamingContent}
                />
              );
            })}

            {/* Streaming message */}
            {isStreaming && streamingContent && (
              <ChatMessage
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent,
                  timestamp: new Date().toISOString(),
                  model: selectedModel
                }}
                isStreaming={true}
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={!sessionId}
        />
      </div>
    </div>
  );
}
