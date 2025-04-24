import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import type { ChatMessage } from '@shared/schema';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
}

export default function ChatInterface({ 
  messages, 
  isLoading, 
  onSendMessage 
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <>
      {/* Chat messages container */}
      <div 
        className="chat-container flex-1 overflow-y-auto px-4 py-6 space-y-4"
        aria-live="polite"
      >
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message}
          />
        ))}
        
        {/* Show typing indicator when loading */}
        {isLoading && (
          <div className="flex items-start space-x-2 max-w-[80%]">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <i className="fas fa-robot text-white"></i>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        {/* Empty div for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="container mx-auto">
          <MessageInput 
            onSendMessage={onSendMessage}
            disabled={isLoading}
          />
          <div className="text-xs text-gray-500 mt-1 px-2">
            Try asking about plant care, crop information, growing seasons, or disease identification
          </div>
        </div>
      </div>
    </>
  );
}
