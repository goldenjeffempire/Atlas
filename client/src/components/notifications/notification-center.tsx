import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { Notification } from "@shared/schema";
import NotificationCard from "./notification-card";
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useDismissNotification,
  useUnreadNotificationsCount
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function NotificationCenter() {
  const { data: notifications, isLoading } = useNotifications();
  const unreadCount = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const dismiss = useDismissNotification();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filter notifications based on active tab
  const filteredNotifications = (() => {
    if (!notifications) return [];

    if (activeTab === "unread") {
      return notifications.filter(notification => !notification.isRead);
    } else if (activeTab === "bookings") {
      return notifications.filter(notification => 
        notification.type === "booking_confirmation" || 
        notification.type === "booking_reminder" ||
        notification.type === "booking_cancellation"
      );
    } else if (activeTab === "system") {
      return notifications.filter(notification => 
        notification.type === "admin_message" || 
        notification.type === "system_alert"
      );
    }
    
    return notifications;
  })();

  const handleDismiss = (id: number) => {
    dismiss.mutate(id);
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    if (!notifications) return;
    
    notifications
      .filter(notification => !notification.isRead)
      .forEach(notification => {
        markAsRead.mutate(notification.id);
      });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[calc(100vh-10rem)]">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification: Notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onDismiss={handleDismiss}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {activeTab === "all"
                      ? "You have no notifications"
                      : activeTab === "unread"
                      ? "You have no unread notifications"
                      : activeTab === "bookings"
                      ? "You have no booking notifications"
                      : "You have no system notifications"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}