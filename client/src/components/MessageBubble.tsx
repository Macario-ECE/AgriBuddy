import KnowledgeCard from './KnowledgeCard';
import type { ChatMessage } from '@shared/schema';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { content, isUser, knowledgeCards } = message;
  
  if (isUser) {
    return (
      <div className="flex items-start justify-end space-x-2 max-w-[80%] ml-auto">
        <div className="bg-primary-light rounded-2xl rounded-tr-none p-4 shadow-sm text-white relative">
          <p>{content}</p>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-light rounded-full opacity-70"></div>
          <div className="absolute -bottom-3 -right-3 w-2 h-2 bg-primary-light rounded-full opacity-50"></div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border-2 border-primary-light">
          <i className="fas fa-user text-primary-dark"></i>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-start space-x-2 max-w-[85%]">
      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 border-2 border-secondary">
        <i className="fas fa-seedling text-white"></i>
      </div>
      <div className="space-y-3">
        <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm relative">
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-secondary rounded-full opacity-30"></div>
          <div className="absolute -top-3 -left-3 w-2 h-2 bg-secondary rounded-full opacity-20"></div>
          <div className="font-medium text-primary mb-1 flex items-center">
            <i className="fas fa-leaf text-secondary text-xs mr-1.5"></i>
            <span>AGRIBUDDY</span>
          </div>
          <p>{content}</p>
        </div>
        
        {/* Render knowledge cards if present */}
        {knowledgeCards && knowledgeCards.length > 0 && (
          <>
            {knowledgeCards.map((card, index) => (
              <KnowledgeCard key={index} card={card} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
