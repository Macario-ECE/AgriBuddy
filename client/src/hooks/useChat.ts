import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendMessage, getChatHistory, createMessage } from '@/lib/openai';
import type { ChatMessage } from '@shared/schema';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const history = await getChatHistory();
        
        // Map the history to our chat message format
        const formattedMessages = history.map((msg) => ({
          id: msg.id.toString(),
          content: msg.content,
          isUser: msg.isUser,
          timestamp: new Date(msg.timestamp),
          knowledgeCards: [],
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history. Using a new conversation.',
          variant: 'destructive',
        });
        
        // Create a welcome message
        setMessages([
          createMessage(
            "Welcome to AGRIBUDDY! I'm your agricultural assistant. Ask me about plants, farming techniques, crop information, or weather advice.",
            false
          ),
        ]);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchChatHistory();
  }, [toast]);

  // Function to send a message and get a response
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message to the UI immediately
    const tempUserMessage = createMessage(content, true);
    setMessages((prev) => [...prev, tempUserMessage]);
    
    setIsLoading(true);
    
    try {
      // Send message to server and get response
      const response = await sendMessage(content);
      
      // Update the messages with the actual response
      setMessages((prev) => {
        // Find and remove our temporary user message
        const withoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id);
        
        // Add the real user and bot messages
        return [
          ...withoutTemp,
          {
            ...response.userMessage,
            timestamp: new Date(response.userMessage.timestamp),
          },
          {
            ...response.botMessage,
            timestamp: new Date(response.botMessage.timestamp),
          },
        ];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
      
      // Remove the temporary user message if there was an error
      setMessages((prev) => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  return {
    messages,
    isLoading: isLoading || isInitializing,
    sendMessage: handleSendMessage,
  };
}
