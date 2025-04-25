import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification, InsertNotification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Get all notifications for the current user
export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    staleTime: 10000, // 10 seconds
    enabled: !!user,
    throwOnError: false,
    onError: (error: Error) => {
      toast({
        title: "Failed to fetch notifications",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Create a new notification
export function useCreateNotification() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationData: InsertNotification) => {
      const res = await apiRequest("POST", "/api/notifications", notificationData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create notification",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Mark a notification as read
export function useMarkNotificationAsRead() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/notifications/${id}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });
}

// Dismiss (delete) a notification
export function useDismissNotification() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to dismiss notification",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Get the count of unread notifications
export function useUnreadNotificationsCount() {
  const { data: notifications } = useNotifications();
  
  if (!notifications) return 0;
  
  return notifications.filter(notification => !notification.isRead).length;
}