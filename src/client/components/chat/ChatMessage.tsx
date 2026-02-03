import { Message } from '../../../shared/types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: string;
}

export function ChatMessage({ message, isStreaming, streamingContent }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const content = isStreaming && streamingContent ? streamingContent : message.content;
  
  // Parse emoji from content (first line)
  const lines = content.split('\n');
  const emojiLine = lines[0]?.trim();
  const hasEmoji = /^[🌿💫🌊✨💛🌀🔄🔒]$/.test(emojiLine);
  
  const displayContent = hasEmoji ? lines.slice(1).join('\n') : content;
  const emoji = hasEmoji ? emojiLine : null;
  
  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} message-enter`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-primary-100 text-primary-600' 
          : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'
      }`}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        {emoji && (
          <div className="text-2xl mb-1">{emoji}</div>
        )}
        <div className={`inline-block text-left px-5 py-4 rounded-2xl whitespace-pre-wrap ${
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
        }`}>
          {/* Render content with bold text support */}
          <div className="prose prose-sm max-w-none">
            {displayContent.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-3 last:mb-0 leading-relaxed">
                {paragraph.split('**').map((part, partIdx) => 
                  partIdx % 2 === 1 ? (
                    <strong key={partIdx} className={isUser ? 'text-white' : 'text-primary-700'}>
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            ))}
          </div>
          
          {/* Streaming cursor */}
          {isStreaming && (
            <span className="cursor-blink ml-1" />
          )}
        </div>
        
        {/* Model info for assistant messages */}
        {!isUser && message.model && (
          <div className="text-xs text-gray-400 mt-1 ml-1">
            {message.model.split('/').pop()?.split(':')[0]}
          </div>
        )}
      </div>
    </div>
  );
}

// Comparison message for side-by-side view
interface ComparisonMessageProps {
  messageA: Message;
  messageB: Message;
  isStreamingA?: boolean;
  isStreamingB?: boolean;
  streamingContentA?: string;
  streamingContentB?: string;
}

export function ComparisonMessage({ 
  messageA, 
  messageB, 
  isStreamingA, 
  isStreamingB,
  streamingContentA,
  streamingContentB 
}: ComparisonMessageProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-xs font-medium text-primary-600 mb-2 pb-2 border-b border-gray-100">
          Model A
        </div>
        <ChatMessage 
          message={messageA} 
          isStreaming={isStreamingA}
          streamingContent={streamingContentA}
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-xs font-medium text-primary-600 mb-2 pb-2 border-b border-gray-100">
          Model B
        </div>
        <ChatMessage 
          message={messageB} 
          isStreaming={isStreamingB}
          streamingContent={streamingContentB}
        />
      </div>
    </div>
  );
}
