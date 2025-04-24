import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LayoutGrid, AlignJustify, Filter } from "lucide-react";
import WorkspaceCard from "@/components/workspace-card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Workspace } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-booking";
import { motion } from "framer-motion";
import { formatWorkspaceType } from "@/lib/utils";

export default function WorkspacesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  
  // Fetch workspaces
  const { data: workspaces, isLoading, error } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });
  
  const createBookingMutation = useCreateBooking();
  
  // Filter workspaces based on search and type
  const filteredWorkspaces = workspaces?.filter((workspace) => {
    const matchesSearch = 
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      selectedType === "all" || workspace.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  const handleBookNow = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setBookingDialogOpen(true);
  };
  
  const handleCreateBooking = () => {
    if (!selectedWorkspace || !selectedDate) return;
    
    const startDateTime = new Date(selectedDate);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(selectedDate);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    createBookingMutation.mutate({
      workspaceId: selectedWorkspace.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      status: "confirmed"
    });
    
    setBookingDialogOpen(false);
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
              <h2 className="text-2xl font-semibold text-gray-900">Available Workspaces</h2>
              <p className="mt-1 text-sm text-gray-500">Find and book your ideal workspace</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex rounded-md shadow-sm">
                <Button
                  variant={viewMode === "list" ? "secondary" : "outline"}
                  className="rounded-l-md rounded-r-none"
                  onClick={() => setViewMode("list")}
                >
                  <AlignJustify className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "outline"}
                  className="rounded-r-md rounded-l-none"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
              </div>
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
                    placeholder="Search workspaces..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedType === "all" ? "secondary" : "outline"}
                  onClick={() => setSelectedType("all")}
                >
                  All Workspaces
                </Button>
                <Button 
                  variant={selectedType === "desk" ? "secondary" : "outline"}
                  onClick={() => setSelectedType("desk")}
                >
                  Desks
                </Button>
                <Button 
                  variant={selectedType === "meeting_room" ? "secondary" : "outline"}
                  onClick={() => setSelectedType("meeting_room")}
                >
                  Meeting Rooms
                </Button>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </Button>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isLoading ? (
              <div className="text-center py-10">Loading workspaces...</div>
            ) : error ? (
              <div className="text-center py-10 text-destructive">Error loading workspaces</div>
            ) : filteredWorkspaces?.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No workspaces found matching your criteria.
              </div>
            ) : (
              <div className={`grid ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
                } gap-6`}
              >
                {filteredWorkspaces?.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    onBookNow={handleBookNow}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Workspace</DialogTitle>
            <DialogDescription>
              Select a date and time to book this workspace.
            </DialogDescription>
          </DialogHeader>
          {selectedWorkspace && (
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="font-medium">{selectedWorkspace.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedWorkspace.location}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatWorkspaceType(selectedWorkspace.type)} · Capacity: {selectedWorkspace.capacity}
                </p>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Select value={startTime} onValueChange={setStartTime}>
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
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Select value={endTime} onValueChange={setEndTime}>
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
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleCreateBooking}
              isLoading={createBookingMutation.isPending}
              disabled={createBookingMutation.isPending || !selectedDate}
            >
              Book Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
