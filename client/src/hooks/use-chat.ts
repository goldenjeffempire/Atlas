import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatResponse = {
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
  citations?: string[];
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (messages: ChatMessage[]) => {
      try {
        console.log('Sending chat messages:', messages);
        const res = await apiRequest('POST', '/api/chat', { messages });
        const data = await res.json() as ChatResponse;
        console.log('Chat response received:', data);
        return data;
      } catch (error) {
        console.error('Chat mutation error:', error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error('Chat error in onError handler:', error);
      toast({
        title: 'Chat Error',
        description: error.message || 'Failed to get a response',
        variant: 'destructive',
      });
      setIsTyping(false);
    },
  });

  // Adds a user message and triggers the AI response
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    // Add user message to state
    const newUserMessage: ChatMessage = { role: 'user' as ChatRole, content: userMessage };
    const newMessages = [...messages, newUserMessage];
    
    setMessages(newMessages);
    setIsTyping(true);
    
    try {
      // Get AI response
      const response = await chatMutation.mutateAsync(newMessages);
      
      // Extract the assistant message from the response
      const assistantMessage = response.choices[0]?.message?.content;
      
      if (assistantMessage) {
        // Add assistant response to messages
        const assistantChatMessage: ChatMessage = { 
          role: 'assistant' as ChatRole, 
          content: assistantMessage 
        };
        setMessages([...newMessages, assistantChatMessage]);
      }
    } catch (error) {
      console.error('Failed to get chat response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Reset the chat conversation
  const resetChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isTyping,
    sendMessage,
    resetChat
  };
}