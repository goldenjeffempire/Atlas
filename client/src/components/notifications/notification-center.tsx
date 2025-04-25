import { useState } from "react";
import { 
  Bell, 
  CheckCircle, 
  Loader2, 
  MessageSquare, 
  Trash2, 
  X 
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, useMarkNotificationAsRead, useDismissNotification, useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { NotificationCard } from "./notification-card";
import { Badge } from "@/components/ui/badge";
import { NotificationType } from "@shared/schema";

// Filters for notification types
type FilterKey = 'all' | 'bookings' | 'messages' | 'system';

const NOTIFICATION_FILTERS: Record<FilterKey, string> = {
  all: "All",
  bookings: "Bookings",
  messages: "Messages",
  system: "System",
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterKey>("all");
  const { data: notifications, isLoading } = useNotifications();
  
  const markAsReadMutation = useMarkNotificationAsRead();
  const dismissMutation = useDismissNotification();
  const unreadCount = useUnreadNotificationsCount();

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleDismiss = (id: number) => {
    dismissMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    if (!notifications) return;
    
    notifications
      .filter(n => !n.isRead)
      .forEach(notification => {
        markAsReadMutation.mutate(notification.id);
      });
  };

  const handleClearAll = () => {
    if (!notifications) return;
    
    notifications.forEach(notification => {
      dismissMutation.mutate(notification.id);
    });
  };

  const filterNotifications = () => {
    if (!notifications) return [];

    if (activeTab === "all") return notifications;

    const filterMap: Record<FilterKey, NotificationType[]> = {
      all: ["booking_confirmation", "booking_reminder", "booking_cancellation", "admin_message", "system_alert"],
      bookings: ["booking_confirmation", "booking_reminder", "booking_cancellation"],
      messages: ["admin_message"],
      system: ["system_alert"],
    };

    return notifications.filter(notification => 
      filterMap[activeTab]?.includes(notification.type)
    );
  };

  const filteredNotifications = filterNotifications();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm md:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </SheetTitle>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 h-8"
                  onClick={handleMarkAllAsRead}
                  disabled={markAsReadMutation.isPending}
                >
                  {markAsReadMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">Mark all read</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1 h-8 text-destructive hover:text-destructive"
                onClick={handleClearAll}
                disabled={dismissMutation.isPending || (notifications?.length === 0)}
              >
                {dismissMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">Clear all</span>
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as FilterKey)} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 px-4 py-2 h-auto">
            {Object.entries(NOTIFICATION_FILTERS).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 px-4 py-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-sm">
                  {activeTab === "all" 
                    ? "You don't have any notifications yet." 
                    : `You don't have any ${NOTIFICATION_FILTERS[activeTab].toLowerCase()} notifications.`
                  }
                </p>
              </div>
            ) : (
              <div className="py-2">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onDismiss={handleDismiss}
                    onRead={handleMarkAsRead}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}