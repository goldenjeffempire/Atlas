import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
    mutationFn: async (userMessage: string) => {
      const requestMessages = [
        {
          role: 'system',
          content: 'You are an AI assistant for the ATLAS workspace booking application. Provide helpful, concise answers about using the app, booking workspaces, and general workspace-related questions. Be friendly and professional.'
        },
        ...messages,
        { role: 'user', content: userMessage }
      ];
      
      const response = await apiRequest(
        "POST", 
        "/api/chat", 
        { messages: requestMessages }
      );
      
      return await response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Chat error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessage = async (userMessage: string) => {
    const newUserMessage: ChatMessage = { role: 'user' as ChatRole, content: userMessage };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    setIsTyping(true);
    try {
      const response = await chatMutation.mutateAsync(userMessage);
      
      if (response.choices && response.choices.length > 0) {
        const assistantChatMessage: ChatMessage = { 
          role: 'assistant', 
          content: response.choices[0].message.content 
        };
        
        setMessages(prevMessages => [...prevMessages, assistantChatMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isTyping,
    sendMessage,
    resetChat,
  };
}