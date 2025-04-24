import { apiRequest } from "./queryClient";
import type { ChatMessage, KnowledgeCard, MessageRequest } from "@shared/schema";

// Function to send a message to the server and get a response
export async function sendMessage(content: string): Promise<{
  userMessage: ChatMessage;
  botMessage: ChatMessage;
}> {
  try {
    const response = await apiRequest('POST', '/api/chat/message', { content });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message. Please try again.');
  }
}

// Function to get chat history
export async function getChatHistory(): Promise<ChatMessage[]> {
  try {
    const response = await fetch('/api/chat/history', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching chat history: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw new Error('Failed to load chat history. Please try again.');
  }
}

// Helper to create a new message
export function createMessage(
  content: string, 
  isUser: boolean,
  knowledgeCards?: KnowledgeCard[]
): ChatMessage {
  return {
    id: Date.now().toString(),
    content,
    isUser,
    timestamp: new Date(),
    knowledgeCards,
  };
}
