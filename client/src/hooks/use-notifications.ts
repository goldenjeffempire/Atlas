import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification, InsertNotification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Get all notifications for the current user
export function useNotifications(options?: { limit?: number, unreadOnly?: boolean }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const queryParams = new URLSearchParams();
  if (options?.limit) queryParams.append('limit', options.limit.toString());
  if (options?.unreadOnly) queryParams.append('unreadOnly', 'true');
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery<Notification[]>({
    queryKey: ["/api/notifications", options],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/notifications${queryString}`);
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

// Get unread notifications count efficiently
export function useUnreadNotificationsCount() {
  const { user } = useAuth();

  return useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
    queryFn: async () => {
      if (!user) return { count: 0 };
      const res = await fetch("/api/notifications/count");
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    staleTime: 10000, // 10 seconds
    enabled: !!user,
    throwOnError: false,
    select: (data) => data || { count: 0 }
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
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    }
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/notifications/mark-all-read");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
      toast({
        title: "Notifications marked as read",
        description: "All notifications have been marked as read",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark notifications as read",
        description: error.message,
        variant: "destructive",
      });
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
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
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

// Clear all notifications
export function useClearAllNotifications() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (readOnly: boolean = false) => {
      const queryParams = readOnly ? '?readOnly=true' : '';
      await apiRequest("DELETE", `/api/notifications${queryParams}`);
    },
    onSuccess: (_data, readOnly) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
      toast({
        title: "Notifications cleared",
        description: readOnly 
          ? "All read notifications have been cleared" 
          : "All notifications have been cleared",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear notifications",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}