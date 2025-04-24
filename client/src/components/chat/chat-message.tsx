import { formatRelative } from 'date-fns';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage, ChatRole } from '@/hooks/use-chat';

interface ChatMessageProps {
  message: ChatMessage;
  timestamp?: Date;
}

export function ChatMessageItem({ message, timestamp }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const time = timestamp ? formatRelative(timestamp, new Date()) : '';
  
  return (
    <div className={cn("flex w-full gap-2 items-start", 
      isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 rounded-full bg-primary p-1.5 text-white">
          <Bot size={18} />
        </div>
      )}
      <div className={cn("flex flex-col max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn("px-3 py-2 rounded-lg", 
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1">{time}</span>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 rounded-full bg-muted p-1.5">
          <User size={18} />
        </div>
      )}
    </div>
  );
}