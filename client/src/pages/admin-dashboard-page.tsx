import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceManagement } from "@/components/workspace-management";
import { 
  Search, 
  LayoutGrid, 
  PlusCircle, 
  BarChart3, 
  CalendarDays, 
  Users, 
  Building, 
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Booking, Workspace } from "@shared/schema";
import BookingCard from "@/components/booking-card";
import { BookingWithWorkspace, useUpdateBooking, useCancelBooking } from "@/hooks/use-booking";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all bookings for admin
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

  // Dummy analytics data (would come from API in real app)
  const analyticsData = {
    totalBookings: bookings.length,
    activeBookings: bookings.filter(b => b.status === "confirmed" && new Date(b.endTime) >= new Date()).length,
    totalWorkspaces: workspaces.length,
    occupancyRate: workspaces.length > 0 
      ? Math.round((bookings.filter(b => b.status === "confirmed" && 
          new Date(b.startTime) <= new Date() && 
          new Date(b.endTime) >= new Date()).length / workspaces.length) * 100) 
      : 0,
    popularWorkspace: workspaces.length > 0 
      ? workspaces.reduce((prev, current) => {
          const prevCount = bookings.filter(b => b.workspaceId === prev.id).length;
          const currentCount = bookings.filter(b => b.workspaceId === current.id).length;
          return currentCount > prevCount ? current : prev;
        }, workspaces[0])
      : null
  };

  const handleReschedule = (booking: BookingWithWorkspace) => {
    // Implementation would open a dialog for rescheduling
    console.log("Reschedule booking", booking.id);
  };

  const handleCancel = (bookingId: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  // Helper function to filter bookings
  const filterBookings = (bookings: BookingWithWorkspace[]) => {
    return bookings.filter(booking => 
      booking.workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.workspace.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get today's bookings
  const todaysBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    const today = new Date();
    return bookingDate.getDate() === today.getDate() &&
           bookingDate.getMonth() === today.getMonth() &&
           bookingDate.getFullYear() === today.getFullYear();
  });

  const filteredBookings = filterBookings(bookings);
  const upcomingBookings = filteredBookings.filter(
    booking => new Date(booking.endTime) >= new Date() && booking.status !== "cancelled"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.companyName || 'Admin'}
            </p>
          </motion.div>

          <div className="mb-6">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start grid grid-cols-5 lg:w-auto">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="workspaces" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Workspaces</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Users</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Analytics</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Bookings</CardTitle>
                        <CardDescription>All time bookings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analyticsData.totalBookings}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Active Bookings</CardTitle>
                        <CardDescription>Current confirmed bookings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analyticsData.activeBookings}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Workspaces</CardTitle>
                        <CardDescription>Available for booking</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analyticsData.totalWorkspaces}</div>
                      </CardContent>
                    </Card>
                    <Card className="w-full lg:w-auto">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Occupancy Rate</CardTitle>
                        <CardDescription>Current utilization</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analyticsData.occupancyRate}%</div>
                        <div className="mt-2 text-sm text-gray-500">
                          {analyticsData.occupancyRate >= 80 ? 'High demand' : 'Available capacity'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Today's Bookings</CardTitle>
                        <CardDescription>
                          {formatDate(new Date())} - {todaysBookings.length} bookings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {todaysBookings.length === 0 ? (
                          <div className="py-8 text-center text-gray-500">
                            No bookings for today
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {todaysBookings.slice(0, 5).map(booking => (
                              <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">{booking.workspace.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                    {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                                <div>
                                  <Badge 
                                    variant={
                                      booking.status === "confirmed" ? "default" : 
                                      booking.status === "cancelled" ? "destructive" : 
                                      "outline"
                                    }
                                  >
                                    {booking.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {todaysBookings.length > 5 && (
                              <div className="text-center">
                                <Button variant="link" onClick={() => setActiveTab("bookings")}>
                                  View all bookings
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common admin tasks</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start" 
                            onClick={() => navigate("/workspaces")}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Booking
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setActiveTab("workspaces")}
                          >
                            <Building className="mr-2 h-4 w-4" />
                            Manage Workspaces
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setActiveTab("users")}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Manage Users
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setActiveTab("analytics")}
                          >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Analytics
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            System Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
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
                    <div>
                      <Button onClick={() => navigate("/workspaces")}>
                        New Booking
                      </Button>
                    </div>
                  </div>

                  {bookingsLoading ? (
                    <div className="text-center py-10">Loading bookings...</div>
                  ) : upcomingBookings.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      No bookings found matching your criteria.
                    </div>
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
                </motion.div>
              </TabsContent>

              {/* Workspaces Tab */}
              <TabsContent value="workspaces">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <WorkspaceManagement />
                </motion.div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-semibold">User Management</h2>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                  <div className="text-center py-10 text-muted-foreground">
                    User management functionality will be implemented in the next phase.
                  </div>
                </motion.div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold">Workspace Analytics</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Bookings</CardTitle>
                        <CardDescription>All time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analyticsData.totalBookings}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Occupancy Rate</CardTitle>
                        <CardDescription>Current utilization</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{analyticsData.occupancyRate}%</div>
                        <div className="mt-2 text-sm text-gray-500">
                          {analyticsData.occupancyRate >= 80 ? 'High demand' : 'Available capacity'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Most Popular</CardTitle>
                        <CardDescription>Most booked workspace</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {analyticsData.popularWorkspace?.name || 'N/A'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Revenue</CardTitle>
                        <CardDescription>This month</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">$5,240</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-medium mb-4">Booking Activity (Last 30 Days)</h3>
                    <div className="h-80 w-full bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">Analytics charts will be implemented in the next phase.</p>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}

// Badge component used in the code
interface BadgeProps {
  variant?: 'default' | 'destructive' | 'outline';
  children: React.ReactNode;
  className?: string;
}

function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-input bg-background text-foreground"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}