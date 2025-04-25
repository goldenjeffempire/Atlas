import { useState } from "react";
import { Notification } from "@shared/schema";
import { Bell, Calendar, Info, MessageCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils";
import { motion } from "framer-motion";

interface NotificationCardProps {
  notification: Notification;
  onDismiss: (id: number) => void;
  onRead: (id: number) => void;
  expandable?: boolean;
}

export function NotificationCard({
  notification,
  onDismiss,
  onRead,
  expandable = true,
}: NotificationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCardClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (expandable) {
      setExpanded(!expanded);
    }
  };

  const renderIcon = () => {
    switch (notification.type) {
      case "booking_confirmation":
      case "booking_reminder":
      case "booking_cancellation":
        return <Calendar className="h-5 w-5 text-primary" />;
      case "admin_message":
        return <MessageCircle className="h-5 w-5 text-indigo-500" />;
      case "system_alert":
        return <Info className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  const renderBadgeText = () => {
    switch (notification.type) {
      case "booking_confirmation":
        return "Confirmation";
      case "booking_reminder":
        return "Reminder";
      case "booking_cancellation":
        return "Cancellation";
      case "admin_message":
        return "Admin";
      case "system_alert":
        return "System";
      default:
        return "Notification";
    }
  };

  const getBadgeVariant = () => {
    switch (notification.type) {
      case "booking_confirmation":
        return "success";
      case "booking_reminder":
        return "default";
      case "booking_cancellation":
        return "destructive";
      case "admin_message":
        return "outline";
      case "system_alert":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`relative mb-3 cursor-pointer overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md ${
          notification.isRead ? "bg-card/60" : "bg-card border-l-4 border-l-primary"
        }`}
        onClick={handleCardClick}
      >
        {!notification.isRead && (
          <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        )}
        
        <div className="relative flex p-4">
          <div className="mr-3 flex-shrink-0">{renderIcon()}</div>
          
          <div className="flex-grow pr-6">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-medium ${notification.isRead ? "text-foreground/70" : "text-foreground"}`}>
                  {notification.title}
                </h4>
                <Badge variant={getBadgeVariant() as any} className="text-[10px]">
                  {renderBadgeText()}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(notification.createdAt)}
              </span>
            </div>
            
            <p className={`text-sm ${notification.isRead ? "text-muted-foreground" : "text-foreground/80"}`}>
              {expanded || !expandable
                ? notification.message
                : notification.message.length > 120
                ? `${notification.message.slice(0, 120)}...`
                : notification.message}
            </p>
            
            {notification.relatedBookingId && expandable && expanded && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Booking ID: {notification.relatedBookingId}
                </Badge>
              </div>
            )}
          </div>
          
          <button
            className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification.id);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}