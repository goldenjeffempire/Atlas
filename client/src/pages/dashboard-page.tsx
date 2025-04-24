import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, PlusIcon, Search, Filter } from "lucide-react";
import BookingCard from "@/components/booking-card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useBookings, BookingWithWorkspace, useUpdateBooking, useCancelBooking } from "@/hooks/use-booking";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { data: bookings, isLoading, error } = useBookings();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithWorkspace | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const currentDate = new Date();
  
  // Define upcoming and past bookings
  const upcomingBookings = bookings?.filter(
    (booking) => new Date(booking.endTime) >= currentDate && booking.status !== "cancelled"
  );
  
  const pastBookings = bookings?.filter(
    (booking) => new Date(booking.endTime) < currentDate || booking.status === "cancelled"
  );
  
  // Filter bookings based on search query
  const filteredUpcomingBookings = upcomingBookings?.filter(
    (booking) => 
      booking.workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.workspace.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPastBookings = pastBookings?.filter(
    (booking) => 
      booking.workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.workspace.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Hooks for mutation
  const updateBookingMutation = useUpdateBooking();
  const cancelBookingMutation = useCancelBooking();

  const handleReschedule = (booking: BookingWithWorkspace) => {
    setSelectedBooking(booking);
    setRescheduleDialogOpen(true);
  };
  
  const handleRescheduleSubmit = () => {
    if (selectedBooking) {
      // In a real application, we would update the booking with new dates here
      // updateBookingMutation.mutate({ id: selectedBooking.id, startTime: newStartTime, endTime: newEndTime });
      setRescheduleDialogOpen(false);
    }
  };
  
  const handleCancel = (bookingId: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };
  
  const handleNewBooking = () => {
    navigate("/workspaces");
  };
  
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
              <h2 className="text-2xl font-semibold text-gray-900">My Bookings</h2>
              <p className="mt-1 text-sm text-gray-500">Manage your workspace reservations</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex gap-2">
                <Calendar className="h-4 w-4" />
                Reschedule
              </Button>
              <Button onClick={handleNewBooking} className="flex gap-2">
                <PlusIcon className="h-4 w-4" />
                New Booking
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
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
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="flex gap-2">
                  All Types
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                <Button variant="outline" className="flex gap-2">
                  Date Range
                  <Calendar className="h-5 w-5 text-gray-400" />
                </Button>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs defaultValue="upcoming" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="border-b border-gray-200 w-full justify-start rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="upcoming"
                  className="py-4 px-1 font-medium border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none bg-transparent"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger 
                  value="past"
                  className="py-4 px-1 font-medium border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 rounded-none bg-transparent ml-8"
                >
                  Past
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="pt-6">
                {isLoading ? (
                  <div className="text-center py-10">Loading bookings...</div>
                ) : error ? (
                  <div className="text-center py-10 text-destructive">Error loading bookings</div>
                ) : filteredUpcomingBookings?.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No upcoming bookings found. 
                    <Button variant="link" onClick={handleNewBooking} className="p-0 h-auto hover:no-underline">
                      Make a new booking
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUpcomingBookings?.map((booking) => (
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
              
              <TabsContent value="past" className="pt-6">
                {isLoading ? (
                  <div className="text-center py-10">Loading bookings...</div>
                ) : error ? (
                  <div className="text-center py-10 text-destructive">Error loading bookings</div>
                ) : filteredPastBookings?.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No past bookings found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPastBookings?.map((booking) => (
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
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogDescription>
              Update the date and time for your booking.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div>
                <p className="font-medium">{selectedBooking.workspace.name}</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.workspace.location}</p>
              </div>
              {/* In a real app, add date/time picker components here */}
              <div>
                <label className="text-sm font-medium">Start Date and Time</label>
                <Input type="datetime-local" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date and Time</label>
                <Input type="datetime-local" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRescheduleSubmit}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
