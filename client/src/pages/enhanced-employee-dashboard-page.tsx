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
  XCircle,
  AlignJustify,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart,
  MapPin,
  Activity,
  Calendar as CalendarIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EnhancedBookingCard from "@/components/enhanced-booking-card";
import { BookingWithWorkspace, useUpdateBooking, useCancelBooking } from "@/hooks/use-booking";
import { Workspace } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatTimeRange } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function EnhancedEmployeeDashboardPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithWorkspace | null>(null);
  
  // Fetch bookings for the current user
  const { data: bookings = [], isLoading, error } = useQuery<BookingWithWorkspace[]>({
    queryKey: ["/api/bookings"],
  });
  
  // Fetch workspaces for quick booking
  const { data: workspaces = [], isLoading: workspacesLoading } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });
  
  // Hooks for mutations
  const updateBookingMutation = useUpdateBooking();
  const cancelBookingMutation = useCancelBooking();

  const handleReschedule = (booking: BookingWithWorkspace) => {
    setSelectedBooking(booking);
    setShowRescheduleDialog(true);
  };

  const handleRescheduleSubmit = () => {
    if (!selectedBooking) return;
    
    // In a real application, we would update the booking here
    // updateBookingMutation.mutate({ id: selectedBooking.id, ... });
    
    toast({
      title: "Booking rescheduled",
      description: `Your booking for ${selectedBooking.workspace.name} has been rescheduled.`,
    });
    
    setShowRescheduleDialog(false);
    setSelectedBooking(null);
  };

  const handleCancel = (bookingId: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
        variant: "destructive"
      });
    }
  };

  // Get bookings by date
  const getTodaysBookings = () => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      const today = new Date();
      return bookingDate.getDate() === today.getDate() &&
             bookingDate.getMonth() === today.getMonth() &&
             bookingDate.getFullYear() === today.getFullYear() &&
             booking.status !== "cancelled";
    });
  };
  
  const getUpcomingBookings = () => {
    return bookings.filter(
      booking => new Date(booking.endTime) >= new Date() && booking.status !== "cancelled"
    );
  };
  
  const getPastBookings = () => {
    return bookings.filter(
      booking => new Date(booking.endTime) < new Date() || booking.status === "cancelled"
    );
  };
  
  // Get bookings stats
  const bookingsStats = {
    total: bookings.length,
    upcoming: getUpcomingBookings().length,
    today: getTodaysBookings().length,
    pastWeek: bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bookingDate >= weekAgo && bookingDate <= new Date();
    }).length
  };
  
  // Get upcomings and filter by search
  const upcomingBookings = getUpcomingBookings();
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
  
  // Get featured/recommended workspaces (for quick booking)
  const recommendedWorkspaces = workspaces.slice(0, 3);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100">
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
                Welcome back, {user?.email?.split("@")[0] || 'Employee'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/notifications")}
                  className="flex gap-2 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-100 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <Bell className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">
                    Notifications
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    )}
                  </span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => navigate("/workspaces")} 
                  className="flex gap-2 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <PlusCircle className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Book Workspace</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            {nextBooking ? (
              <AnimatedCard hover="lift">
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100 overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-500" /> Your Next Booking
                    </CardTitle>
                    <CardDescription>
                      {formatDate(new Date(nextBooking.startTime))}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-white shadow-md flex items-center justify-center relative overflow-hidden">
                        <span className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100"></span>
                        <Calendar className="h-8 w-8 text-primary relative z-10" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{nextBooking.workspace.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {nextBooking.workspace.location}
                        </div>
                        <p className="text-sm font-medium mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-indigo-500" />
                          {formatTimeRange(new Date(nextBooking.startTime), new Date(nextBooking.endTime))}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <motion.div 
                          className="flex gap-2" 
                          whileHover={{ y: -2 }}
                        >
                          <Button 
                            variant="outline" 
                            className="mr-2 border-purple-200 hover:bg-purple-50"
                            onClick={() => handleReschedule(nextBooking)}
                          >
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleCancel(nextBooking.id)}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Cancel
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-indigo-500"></div>
                </Card>
              </AnimatedCard>
            ) : (
              <AnimatedCard>
                <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-gray-400" /> No Upcoming Bookings
                    </CardTitle>
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
                          className="pl-0 h-auto mt-1 text-primary" 
                          onClick={() => navigate("/workspaces")}
                        >
                          Book a workspace now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <div className="h-1 w-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
                </Card>
              </AnimatedCard>
            )}
          </motion.div>
          
          {/* Booking stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <AnimatedCard delay={0.1} hover="bounce">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-md transition-shadow overflow-hidden border-purple-100">
                <CardContent className="p-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                    <Calendar className="w-full h-full text-purple-600" />
                  </div>
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-3 shadow-sm">
                      <Calendar className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Today's Bookings</p>
                      <p className="text-2xl font-bold text-purple-900">{bookingsStats.today}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
            
            <AnimatedCard delay={0.2} hover="bounce">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-shadow overflow-hidden border-blue-100">
                <CardContent className="p-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                    <Clock className="w-full h-full text-blue-600" />
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-3 shadow-sm">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Upcoming</p>
                      <p className="text-2xl font-bold text-blue-900">{bookingsStats.upcoming}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
            
            <AnimatedCard delay={0.3} hover="bounce">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-shadow overflow-hidden border-green-100">
                <CardContent className="p-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                    <User className="w-full h-full text-green-600" />
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-3 shadow-sm">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Past Week</p>
                      <p className="text-2xl font-bold text-green-900">{bookingsStats.pastWeek}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
            
            <AnimatedCard delay={0.4} hover="bounce">
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-md transition-shadow overflow-hidden border-amber-100">
                <CardContent className="p-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                    <BarChart className="w-full h-full text-amber-600" />
                  </div>
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-3 rounded-full mr-3 shadow-sm">
                      <BarChart className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-bold text-amber-900">{bookingsStats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
          
          {/* Bookings and recommended workspaces section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:col-span-2"
            >
              <Card className="shadow-sm overflow-hidden border-purple-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                    Your Bookings
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={viewMode === "list" ? "secondary" : "outline"} 
                      size="sm" 
                      onClick={() => setViewMode("list")}
                      className="h-8 px-2 text-xs"
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === "calendar" ? "secondary" : "outline"} 
                      size="sm" 
                      onClick={() => setViewMode("calendar")}
                      className="h-8 px-2 text-xs"
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
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
                  
                  <Tabs defaultValue="upcoming" className="mt-2">
                    <TabsList className="w-full flex mb-4">
                      <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
                      <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upcoming">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="inline-block"
                          >
                            <Clock className="h-8 w-8 text-purple-500 opacity-50" />
                          </motion.div>
                          <p className="mt-2 text-gray-500">Loading bookings...</p>
                        </div>
                      ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>No upcoming bookings found.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <AnimatePresence>
                            {filteredBookings.map((booking) => (
                              <EnhancedBookingCard
                                key={booking.id}
                                booking={booking}
                                onReschedule={handleReschedule}
                                onCancel={handleCancel}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="past">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="inline-block"
                          >
                            <Clock className="h-8 w-8 text-purple-500 opacity-50" />
                          </motion.div>
                          <p className="mt-2 text-gray-500">Loading bookings...</p>
                        </div>
                      ) : getPastBookings().length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>No past bookings found.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <AnimatePresence>
                            {getPastBookings().slice(0, 5).map((booking) => (
                              <EnhancedBookingCard
                                key={booking.id}
                                booking={booking}
                                onReschedule={handleReschedule}
                                onCancel={handleCancel}
                                isPast={true}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-6"
            >
              <AnimatedCard hover="glow">
                <Card className="border-purple-100 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bell className="h-4 w-4 text-purple-600" />
                      Recent Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No notifications to display
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {notifications.slice(0, 3).map(notification => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`p-3 border rounded-lg ${notification.read ? 'bg-white' : 'bg-gray-50'} hover:shadow-sm transition-shadow`}
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
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div className="text-center">
                          <Button 
                            variant="link"
                            size="sm"
                            onClick={() => navigate("/notifications")}
                            className="text-xs"
                          >
                            View all notifications
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
              
              <AnimatedCard hover="lift" delay={0.2}>
                <Card className="border-purple-100 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PlusCircle className="h-4 w-4 text-purple-600" />
                      Quick Book
                    </CardTitle>
                    <CardDescription>Recommended workspaces</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    {workspacesLoading ? (
                      <div className="text-center py-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="inline-block"
                        >
                          <Clock className="h-6 w-6 text-purple-500 opacity-50" />
                        </motion.div>
                        <p className="mt-2 text-sm text-gray-500">Loading workspaces...</p>
                      </div>
                    ) : recommendedWorkspaces.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No recommended workspaces
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recommendedWorkspaces.map(workspace => (
                          <motion.div
                            key={workspace.id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/workspaces/${workspace.id}/book`)}
                          >
                            <div className="aspect-w-2 aspect-h-1 bg-gray-200">
                              <img 
                                src={workspace.imageUrl || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000"} 
                                alt={workspace.name}
                                className="w-full h-16 object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            </div>
                            <div className="p-3">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-medium truncate">{workspace.name}</h3>
                                <span className="bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5">
                                  Available
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 flex items-center mb-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                {workspace.location}
                              </p>
                              <Button 
                                size="sm" 
                                className="w-full"
                              >
                                Book Now
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </motion.div>
          </div>
          
          {/* Reschedule Dialog */}
          <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Reschedule Booking
                </DialogTitle>
                <DialogDescription>
                  Update the date and time for your booking.
                </DialogDescription>
              </DialogHeader>
              {selectedBooking && (
                <div className="grid gap-4 py-4">
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <p className="font-medium">{selectedBooking.workspace.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedBooking.workspace.location}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date</Label>
                    <div className="border rounded-md p-2">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-sm">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setSelectedDate(newDate);
                          }}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setSelectedDate(newDate);
                          }}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Simple calendar grid for the demo */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                          <div key={i} className="py-1 font-medium text-gray-500">{day}</div>
                        ))}
                        {Array.from({ length: 35 }).map((_, i) => (
                          <Button
                            key={i}
                            variant={i === 15 ? "secondary" : "ghost"}
                            size="sm"
                            className={`h-7 w-7 p-0 ${i === 15 ? 'bg-purple-100 text-purple-900' : ''}`}
                          >
                            {(i % 31) + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Start Time</Label>
                      <Select defaultValue="09:00">
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="13:00">1:00 PM</SelectItem>
                          <SelectItem value="14:00">2:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">End Time</Label>
                      <Select defaultValue="17:00">
                        <SelectTrigger>
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="13:00">1:00 PM</SelectItem>
                          <SelectItem value="14:00">2:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRescheduleSubmit} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  Confirm Reschedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}