import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Wifi, 
  Coffee, 
  Monitor, 
  CheckCheck 
} from "lucide-react";
import { Workspace } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-booking";
import { motion } from "framer-motion";
import { formatWorkspaceType, formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function BookingDetailPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/workspaces/:id/book");
  const workspaceId = params?.id ? parseInt(params.id) : null;
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  
  // Fetch workspace details
  const { data: workspace, isLoading, error } = useQuery<Workspace>({
    queryKey: [`/api/workspaces/${workspaceId}`],
    enabled: !!workspaceId
  });
  
  const createBookingMutation = useCreateBooking();
  
  const handleCreateBooking = () => {
    if (!workspace || !selectedDate) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your booking.",
        variant: "destructive"
      });
      return;
    }
    
    const startDateTime = new Date(selectedDate);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(selectedDate);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // Validate times
    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time.",
        variant: "destructive"
      });
      return;
    }
    
    createBookingMutation.mutate({
      workspaceId: workspace.id,
      startTime: startDateTime,
      endTime: endDateTime,
      status: "confirmed",
      title: `Booking for ${workspace.name}`,
      description: "Regular workspace booking",
      participants: null, // Add empty participants
      paymentStatus: "unpaid",
      amount: (workspace as any).hourlyRate ? 
        Math.round((endDateTime.getTime() - startDateTime.getTime()) / 3600000) * (workspace as any).hourlyRate : 0
    });
  };
  
  // After successful booking, navigate to dashboard
  if (createBookingMutation.isSuccess) {
    toast({
      title: "Booking confirmed!",
      description: "Your workspace has been successfully booked.",
      variant: "default"
    });
    navigate("/");
  }
  
  const handleBack = () => {
    navigate("/workspaces");
  };
  
  // Helper function to generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      slots.push(`${formattedHour}:00`);
      if (hour < 18) {
        slots.push(`${formattedHour}:30`);
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workspaces
          </Button>
          
          {isLoading ? (
            <div className="text-center py-10">Loading workspace details...</div>
          ) : error || !workspace ? (
            <div className="text-center py-10 text-destructive">
              Error loading workspace details. 
              <Button variant="link" onClick={handleBack}>
                Go back to workspace listing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img 
                      src={workspace.imageUrl || "https://images.unsplash.com/photo-1587316205943-b15dc52a12e0?q=80&w=1000"}
                      alt={workspace.name}
                      className="w-full h-[300px] object-cover"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="font-normal">
                        {formatWorkspaceType(workspace.type)}
                      </Badge>
                      <Badge variant="outline" className="font-normal text-green-600 bg-green-50 border-green-100">
                        Available
                      </Badge>
                    </div>
                    
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">{workspace.name}</h1>
                    
                    <div className="flex items-center text-gray-500 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{workspace.location}</span>
                    </div>
                    
                    {isLoading ? (
                      <div className="grid grid-cols-2 gap-4 mb-6 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    ) : error ? (
                      <div className="text-red-500 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>Failed to load workspace details</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-2" />
                          <span>Capacity: {workspace.capacity}</span>
                        </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <span>8:00 AM - 6:00 PM</span>
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-medium mb-3">Features</h2>
                    <div className="grid grid-cols-2 gap-y-3">
                      {(workspace.features as string[]).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center mr-2">
                            {feature.includes('Wi-Fi') ? (
                              <Wifi className="h-4 w-4 text-purple-600" />
                            ) : feature.includes('Coffee') ? (
                              <Coffee className="h-4 w-4 text-purple-600" />
                            ) : feature.includes('Monitor') || feature.includes('Screen') ? (
                              <Monitor className="h-4 w-4 text-purple-600" />
                            ) : (
                              <CheckCheck className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <h2 className="text-lg font-medium mb-3">Description</h2>
                      <p className="text-gray-600">
                        {workspace.description || `A comfortable ${formatWorkspaceType(workspace.type).toLowerCase()} located in ${workspace.location}. Perfect for focused work or collaborative meetings.`}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                  <h2 className="text-xl font-semibold mb-4">Book this workspace</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={`start-${time}`} value={time}>
                              {time.replace(':', ':').padStart(5, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <Select value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={`end-${time}`} value={time}>
                              {time.replace(':', ':').padStart(5, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <Input 
                      placeholder="Any special requests or notes"
                    />
                  </div>
                  
                  <div className="py-4 border-t border-b border-gray-200 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">
                        {selectedDate ? formatDate(selectedDate) : 'Select a date'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">
                        {startTime} - {endTime}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handleCreateBooking}
                    disabled={createBookingMutation.isPending || !selectedDate}
                  >
                    {createBookingMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}