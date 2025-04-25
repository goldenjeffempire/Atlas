import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Calendar, 
  PlusCircle, 
  Bell, 
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import BookingCard from "@/components/booking-card";
import { BookingWithWorkspace, useUpdateBooking, useCancelBooking } from "@/hooks/use-booking";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatTimeRange } from "@/lib/utils";

export default function EmployeeDashboardPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch bookings for the current user
  const { data: bookings = [], isLoading, error } = useQuery<BookingWithWorkspace[]>({
    queryKey: ["/api/bookings"],
  });
  
  // Hooks for mutations
  const updateBookingMutation = useUpdateBooking();
  const cancelBookingMutation = useCancelBooking();

  const handleReschedule = (booking: BookingWithWorkspace) => {
    // Implementation would open a dialog for rescheduling
  };

  const handleCancel = (bookingId: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  // Get upcoming bookings
  const upcomingBookings = bookings.filter(
    booking => new Date(booking.endTime) >= new Date() && booking.status !== "cancelled"
  );
  
  // Filter bookings based on search
  const filteredBookings = upcomingBookings.filter(booking => 
    booking.workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.workspace.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get next booking (closest upcoming booking)
  const nextBooking = upcomingBookings.length > 0 
    ? upcomingBookings.reduce((closest, current) => {
        if (!closest) return current;
        const closestTime = new Date(closest.startTime).getTime();
        const currentTime = new Date(current.startTime).getTime();
        const now = Date.now();
        if (currentTime >= now && (currentTime < closestTime || closestTime < now)) {
          return current;
        }
        return closest;
      }, null as BookingWithWorkspace | null)
    : null;
    
  // Mock notifications for the demo
  const notifications = [
    {
      id: 1,
      title: "Booking Confirmed",
      description: "Your booking for 'Meeting Room 3' has been confirmed.",
      time: "2 hours ago",
      read: false,
      type: "success"
    },
    {
      id: 2,
      title: "Booking Reminder",
      description: "Your booking for 'Open Workspace' starts in 30 minutes.",
      time: "30 minutes ago",
      read: false,
      type: "info"
    },
    {
      id: 3,
      title: "Booking Cancelled",
      description: "Your booking for 'Phone Booth 2' has been cancelled.",
      time: "1 day ago",
      read: true,
      type: "error"
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Employee Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.name || user?.email?.split("@")[0] || 'Employee'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/notifications")}
                className="flex gap-2"
              >
                <Bell className="h-4 w-4" />
                <span className="relative">
                  Notifications
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  )}
                </span>
              </Button>
              <Button onClick={() => navigate("/workspaces")} className="flex gap-2">
                <PlusCircle className="h-4 w-4" />
                Book Workspace
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            {nextBooking ? (
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
                <CardHeader>
                  <CardTitle className="text-lg">Your Next Booking</CardTitle>
                  <CardDescription>
                    {formatDate(new Date(nextBooking.startTime))}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white shadow-md flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{nextBooking.workspace.name}</h3>
                      <p className="text-sm text-gray-500">{nextBooking.workspace.location}</p>
                      <p className="text-sm font-medium mt-1">
                        {formatTimeRange(new Date(nextBooking.startTime), new Date(nextBooking.endTime))}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Button 
                        variant="outline" 
                        className="mr-2"
                        onClick={() => handleReschedule(nextBooking)}
                      >
                        Reschedule
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleCancel(nextBooking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg">No Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white shadow-md flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-600">You don't have any upcoming bookings.</p>
                      <Button 
                        variant="link" 
                        className="pl-0 h-auto mt-1" 
                        onClick={() => navigate("/workspaces")}
                      >
                        Book a workspace now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Your Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input 
                        type="search" 
                        placeholder="Search bookings..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Tabs defaultValue="upcoming">
                    <TabsList className="w-full flex mb-4">
                      <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
                      <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upcoming">
                      {isLoading ? (
                        <div className="text-center py-8">Loading bookings...</div>
                      ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No upcoming bookings found.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredBookings.map((booking) => (
                            <div key={booking.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-primary">
                                  {booking.workspace.type === "desk" ? (
                                    <span className="text-lg">D</span>
                                  ) : booking.workspace.type === "meeting_room" ? (
                                    <span className="text-lg">M</span>
                                  ) : (
                                    <span className="text-lg">W</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{booking.workspace.name}</p>
                                  <p className="text-sm text-gray-500">{formatDate(new Date(booking.startTime))}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleReschedule(booking)}
                                >
                                  Reschedule
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleCancel(booking.id)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="past">
                      <div className="text-center py-8 text-muted-foreground">
                        Past booking history will be displayed here.
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No notifications to display
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.slice(0, 3).map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border rounded-lg ${notification.read ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`rounded-full p-2 ${
                              notification.type === 'success' ? 'bg-green-100 text-green-600' :
                              notification.type === 'error' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notification.type === 'success' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : notification.type === 'error' ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center">
                        <Button 
                          variant="link"
                          onClick={() => navigate("/notifications")}
                        >
                          View all notifications
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}