import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChatMessageItem } from './chat-message';
import { ChatInput } from './chat-input';
import { useChat, ChatMessage, ChatRole } from '@/hooks/use-chat';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isTyping, sendMessage, resetChat } = useChat();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  // Handle the welcome message with useEffect that runs only once
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // If there are no messages in the cache, add a welcome message when component loads
    const currentMessages = queryClient.getQueryData<ChatMessage[]>(['chatMessages']) || [];
    if (currentMessages.length === 0) {
      queryClient.setQueryData(['chatMessages'], [{ 
        role: 'assistant' as ChatRole, 
        content: 'Hello! I am ATLAS Assistant. How can I help you with workspace bookings, account management, or other workspace-related questions?' 
      }]);
    }
  }, [queryClient]);
  
  // Use messages directly from the hook now
  const displayMessages = messages;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              height: isMinimized ? 'auto' : '400px',
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="mb-2 w-80 sm:w-96 bg-background rounded-lg shadow-lg border border-border flex flex-col overflow-hidden"
          >
            {/* Chat header */}
            <div className="p-3 border-b flex items-center justify-between bg-secondary/30">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <MessageCircle size={16} className="text-primary" />
                ATLAS Assistant
              </h3>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={toggleMinimize}
                >
                  {isMinimized ? <Maximize size={14} /> : <Minimize size={14} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={toggleChat}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {displayMessages.map((message, i) => (
                  <ChatMessageItem 
                    key={i} 
                    message={message} 
                    timestamp={new Date()} 
                  />
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 rounded-full bg-primary/20 p-2">
                      <Loader2 size={16} className="animate-spin text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">ATLAS Assistant is typing...</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input area */}
            {!isMinimized && (
              <div className="p-3 border-t">
                <ChatInput 
                  onSend={sendMessage} 
                  isDisabled={isTyping}
                  placeholder="Ask ATLAS Assistant..."
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat toggle button */}
      <Button 
        onClick={toggleChat}
        size="icon"
        className="rounded-full h-12 w-12 shadow-lg"
      >
        <MessageCircle size={20} />
      </Button>
    </div>
  );
}