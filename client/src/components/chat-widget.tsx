import { useState, useRef, useEffect } from "react";
import { ChatMessage, useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, X, Send, Bot, User, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const { messages, sendMessage, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    
    sendMessage(newMessage);
    setNewMessage("");
  };

  const quickResponses = [
    "How do I book a workspace?",
    "I need help with my booking",
    "How do I cancel a reservation?",
    "What are the availability hours?"
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl w-80 sm:w-96 mb-2 border overflow-hidden flex flex-col"
            style={{ height: "500px", maxHeight: "70vh" }}
          >
            <div className="bg-primary p-3 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot size={18} />
                <div>
                  <h3 className="font-medium">ATLAS AI Support</h3>
                  <p className="text-xs opacity-80">Ask me anything about workspaces</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white h-8 w-8 rounded-full hover:bg-primary-foreground/20">
                <X size={18} />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-3">
              <div className="flex flex-col space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">
                    <Bot className="mx-auto mb-2 h-12 w-12 text-muted-foreground/60" />
                    <h3 className="font-medium mb-1">Welcome to ATLAS Support</h3>
                    <p className="text-sm">How can I help you today?</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 mt-1">
                          {msg.role === 'user' ? (
                            <>
                              <AvatarImage src={user?.avatarUrl || ""} />
                              <AvatarFallback className="bg-primary/80 text-white">
                                <User size={16} />
                              </AvatarFallback>
                            </>
                          ) : (
                            <>
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-slate-700 text-white">
                                <Bot size={16} />
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        
                        <div 
                          className={`rounded-lg p-3 ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {messages.length === 0 && (
              <div className="p-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Quick responses:</p>
                <div className="flex flex-wrap gap-2">
                  {quickResponses.map((response, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => {
                        setNewMessage(response);
                      }}
                    >
                      {response}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="min-h-0 h-10 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isTyping || newMessage.trim() === ""}
                className={isTyping ? "opacity-70" : ""}
              >
                <Send size={18} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <ChevronDown size={24} />
        ) : (
          <MessageSquare size={24} />
        )}
      </motion.button>
    </div>
  );
}