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
  Users,
  ArrowRight,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Workspace, Booking } from "@shared/schema";
import BookingCard from "@/components/booking-card";
import { BookingWithWorkspace, useUpdateBooking, useCancelBooking } from "@/hooks/use-booking";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatTimeRange, formatWorkspaceType } from "@/lib/utils";

export default function GeneralDashboardPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch bookings for the current user
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithWorkspace[]>({
    queryKey: ["/api/bookings"],
  });
  
  // Fetch all workspaces
  const { data: workspaces = [], isLoading: workspacesLoading } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
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
  
  // Get featured workspaces (just a subset for demo purposes)
  const featuredWorkspaces = workspaces.slice(0, 3);
  
  // Mock notifications - would come from API in real app
  const unreadNotificationsCount = 2;
  
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
              <h1 className="text-2xl font-semibold text-gray-900">Welcome to ATLAS</h1>
              <p className="mt-1 text-sm text-gray-500">
                Hello, {user?.email?.split("@")[0] || user?.companyName || 'there'}! Find and book your ideal workspace.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/notifications")}
                className="flex gap-2 relative"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {unreadNotificationsCount}
                  </span>
                )}
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="md:col-span-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
              <CardHeader>
                <CardTitle>Quick Book</CardTitle>
                <CardDescription>Find and book a workspace right away</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input 
                    placeholder="Search for a workspace..." 
                    className="flex-1"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/search/${encodeURIComponent(e.currentTarget.value)}`);
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate("/workspaces")}
                    >
                      Browse All
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        if (searchQuery) {
                          navigate(`/search/${encodeURIComponent(searchQuery)}`);
                        } else {
                          navigate("/workspaces");
                        }
                      }}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-between bg-white bg-opacity-50">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                    <span className="text-sm">Available Now</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-amber-500"></div>
                    <span className="text-sm">Limited Availability</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-red-500"></div>
                    <span className="text-sm">Fully Booked</span>
                  </div>
                </div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={() => navigate("/workspaces")}
                >
                  View all options
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>Overview of your bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span>Upcoming Bookings</span>
                    </div>
                    <Badge variant="secondary">{upcomingBookings.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span>Today's Bookings</span>
                    </div>
                    <Badge variant="secondary">
                      {bookings.filter(b => {
                        const bookingDate = new Date(b.startTime);
                        const today = new Date();
                        return bookingDate.getDate() === today.getDate() &&
                               bookingDate.getMonth() === today.getMonth() &&
                               bookingDate.getFullYear() === today.getFullYear();
                      }).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span>Total Bookings</span>
                    </div>
                    <Badge variant="secondary">{bookings.length}</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-center">
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => navigate("/workspaces")}
                >
                  Book New Workspace
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
            <Tabs defaultValue="upcoming">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                {bookingsLoading ? (
                  <div className="text-center py-10">Loading bookings...</div>
                ) : upcomingBookings.length === 0 ? (
                  <Card className="text-center py-10 bg-white">
                    <CardContent>
                      <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                      <p className="text-muted-foreground mb-4">
                        You don't have any upcoming workspace reservations.
                      </p>
                      <Button onClick={() => navigate("/workspaces")}>
                        Book a Workspace
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onReschedule={handleReschedule}
                        onCancel={handleCancel}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="past">
                <Card className="text-center py-10 bg-white">
                  <CardContent>
                    <p className="text-muted-foreground">
                      Past booking history will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Featured Workspaces</h2>
              <Button 
                variant="ghost" 
                className="flex items-center gap-1"
                onClick={() => navigate("/workspaces")}
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            {workspacesLoading ? (
              <div className="text-center py-10">Loading workspaces...</div>
            ) : featuredWorkspaces.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No featured workspaces available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredWorkspaces.map((workspace) => (
                  <Card key={workspace.id} className="overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <img 
                        src={workspace.imageUrl || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000"}
                        alt={workspace.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{workspace.name}</h3>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Available
                        </Badge>
                      </div>
                      <div className="flex items-center text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{workspace.location}</span>
                      </div>
                      <div className="mb-3">
                        <Badge variant="outline" className="mr-2">
                          {formatWorkspaceType(workspace.type)}
                        </Badge>
                        <Badge variant="outline">
                          Capacity: {workspace.capacity}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(workspace.features as string[]).slice(0, 3).map((feature: string, index: number) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                            {feature}
                          </span>
                        ))}
                        {(workspace.features as string[]).length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                            +{(workspace.features as string[]).length - 3} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/workspaces/${workspace.id}/book`)}
                      >
                        Book Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}