import { useRef, useState, KeyboardEvent } from 'react';
import { SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isDisabled, placeholder = 'Type a message...' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isDisabled) {
      onSend(message);
      setMessage('');
      
      // Refocus the textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 w-full">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-10 resize-none"
        disabled={isDisabled}
        rows={1}
      />
      <Button 
        size="icon" 
        type="submit" 
        disabled={!message.trim() || isDisabled}
        onClick={handleSend}
        className="flex-shrink-0"
      >
        <SendHorizonal size={18} />
      </Button>
    </div>
  );
}