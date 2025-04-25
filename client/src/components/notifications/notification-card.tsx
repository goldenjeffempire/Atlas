import { BellRing, X } from "lucide-react";
import { Notification } from "@shared/schema";
import { formatTimeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: Notification;
  onDismiss: (id: number) => void;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationCard({
  notification,
  onDismiss,
  onMarkAsRead,
}: NotificationCardProps) {
  const getIconForType = (type: string) => {
    switch (type) {
      case "booking_confirmation":
        return <BellRing className="h-5 w-5 text-green-500" />;
      case "booking_reminder":
        return <BellRing className="h-5 w-5 text-blue-500" />;
      case "booking_cancellation":
        return <BellRing className="h-5 w-5 text-red-500" />;
      case "admin_message":
        return <BellRing className="h-5 w-5 text-purple-500" />;
      case "system_alert":
        return <BellRing className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellRing className="h-5 w-5" />;
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-start gap-4 rounded-lg border p-4 mb-3 transition-all",
        notification.isRead
          ? "bg-card"
          : "bg-accent border-l-4 border-l-primary"
      )}
      onClick={handleClick}
    >
      <div className="mt-1">{getIconForType(notification.type)}</div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">{notification.title}</h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification.id);
            }}
            className="text-muted-foreground hover:text-foreground rounded-full p-1"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}