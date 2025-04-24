import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertBooking, Booking } from "@shared/schema";

export type BookingWithWorkspace = Booking & {
  workspace: {
    id: number;
    name: string;
    location: string;
    imageUrl: string;
    features: string[];
    type: string;
  };
};

export function useBookings() {
  return useQuery<BookingWithWorkspace[], Error>({
    queryKey: ["/api/bookings"],
  });
}

export function useCreateBooking() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (bookingData: Omit<InsertBooking, "userId">) => {
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking created",
        description: `You've successfully booked ${data.workspace.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBooking() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...data 
    }: { id: number } & Partial<Booking>) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking updated",
        description: "Your booking has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCancelBooking() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
