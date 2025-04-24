import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ChatInterface from '@/components/ChatInterface';
import InfoPanel from '@/components/InfoPanel';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Home() {
  const isMobile = useIsMobile();
  const [showInfoPanel, setShowInfoPanel] = useState(!isMobile);
  const { messages, isLoading, sendMessage } = useChat();

  // Toggle info panel for mobile view
  const toggleInfoPanel = () => {
    setShowInfoPanel(!showInfoPanel);
  };

  return (
    <div className="flex flex-col h-screen bg-background leaf-pattern-bg">
      <Header onToggleInfoPanel={toggleInfoPanel} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main chat area */}
        <main className={`flex-1 flex flex-col relative overflow-hidden ${showInfoPanel && isMobile ? 'hidden' : ''}`}>
          <ChatInterface 
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
          />
        </main>
        
        {/* Info panel - conditionally shown based on state and screen size */}
        {showInfoPanel && (
          <InfoPanel 
            className={isMobile ? "fixed inset-0 z-20 w-full" : "w-80 hidden md:block"}
            onClose={isMobile ? toggleInfoPanel : undefined}
          />
        )}
      </div>
      
      {/* Mobile floating button to show info panel when hidden */}
      {isMobile && !showInfoPanel && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 right-4 z-10 rounded-full bg-primary text-white shadow-md hover:bg-primary-dark"
          onClick={toggleInfoPanel}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
