import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Notification, InsertNotification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    staleTime: 10 * 1000, // 10 seconds
  });
}

export function useCreateNotification() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationData: InsertNotification) => {
      const res = await apiRequest("POST", "/api/notifications", notificationData);
      return res.json();
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

export function useMarkNotificationAsRead() {
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
}

export function useDismissNotification() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await apiRequest("DELETE", `/api/notifications/${notificationId}`);
      if (!res.ok) {
        throw new Error("Failed to dismiss notification");
      }
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

export function useUnreadNotificationsCount() {
  const { data: notifications } = useNotifications();
  
  const unreadCount = notifications?.filter(notification => !notification.read).length || 0;
  
  return unreadCount;
}