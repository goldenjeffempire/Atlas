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
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("all");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [capacity, setCapacity] = useState<number | undefined>(undefined);
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
  
  // Helper functions to get unique values from workspaces
  const getUniqueLocations = () => {
    if (!workspaces) return [];
    const locations = workspaces.map(workspace => workspace.location);
    return ["all", ...Array.from(new Set(locations))];
  };
  
  const getUniqueOrganizations = () => {
    if (!workspaces) return [];
    // Extract organization names from features if available
    const orgs = workspaces
      .filter(ws => ws.features && typeof ws.features === 'object')
      .map(ws => {
        const features = ws.features as any;
        return features.organization || "Unknown";
      });
    return ["all", ...Array.from(new Set(orgs))];
  };
  
  const getAllWorkspaceFeatures = () => {
    if (!workspaces) return [];
    
    // Collect all unique feature keys across workspaces
    const allFeatures = new Set<string>();
    workspaces.forEach(workspace => {
      if (workspace.features && typeof workspace.features === 'object') {
        const features = workspace.features as any;
        Object.keys(features)
          .filter(key => key !== 'organization' && typeof features[key] === 'boolean' && features[key])
          .forEach(feature => allFeatures.add(feature));
      }
    });
    
    return Array.from(allFeatures);
  };
  
  // Get all workspace types from schema
  const workspaceTypes = ["all", "desk", "meeting_room", "collaborative_space", "private_office", "focus_pod"];
  
  // Available workspace features (common features)
  const commonFeatures = [
    "has_monitor", "has_projector", "has_whiteboard", 
    "has_videoconference", "has_power", "has_ethernet",
    "has_natural_light", "is_quiet_zone", "is_accessible",
    "has_phone_booth", "has_kitchen_access"
  ];
  
  // Availability status options
  const availabilityOptions = ["all", "available", "partially_available", "unavailable"];
  
  // Filter workspaces based on all criteria
  const filteredWorkspaces = workspaces?.filter((workspace) => {
    const matchesSearch = 
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      selectedType === "all" || workspace.type === selectedType;
    
    const matchesLocation = 
      selectedLocation === "all" || workspace.location === selectedLocation;
    
    const matchesCapacity = 
      !capacity || workspace.capacity >= capacity;
    
    // Organization filtering
    const matchesOrganization = selectedOrganization === "all" || 
      (workspace.features && 
       typeof workspace.features === 'object' && 
       (workspace.features as any).organization === selectedOrganization);
    
    // Feature filtering
    const matchesFeatures = selectedFeatures.length === 0 || 
      (workspace.features && typeof workspace.features === 'object' && 
       selectedFeatures.every(feature => (workspace.features as any)[feature]));
    
    // Availability filtering (simplified for now)
    const matchesAvailability = selectedAvailability === "all" || 
      (selectedAvailability === "available" && workspace.isActive);
    
    return matchesSearch && matchesType && matchesLocation && 
           matchesCapacity && matchesOrganization && 
           matchesFeatures && matchesAvailability;
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
      startTime: startDateTime,
      endTime: endDateTime,
      status: "confirmed",
      title: `Booking for ${selectedWorkspace.name}`,
      description: "Regular workspace booking",
      participants: null,
      paymentStatus: "unpaid",
      amount: selectedWorkspace.hourlyRate ? 
        Math.round((endDateTime.getTime() - startDateTime.getTime()) / 3600000) * selectedWorkspace.hourlyRate : 0
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
                <Button 
                  variant={selectedType === "collaborative_space" ? "secondary" : "outline"}
                  onClick={() => setSelectedType("collaborative_space")}
                >
                  Collaborative Spaces
                </Button>
                <Button 
                  variant="outline" 
                  className="flex gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5" />
                  Filters
                </Button>
              </div>
              
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white p-4 rounded-lg shadow-sm mt-4"
                >
                  <h3 className="font-medium mb-3">Advanced Filters</h3>
                  <div className="space-y-6">
                    {/* Basic filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Location Filter */}
                      <div>
                        <label className="text-sm font-medium block mb-1">Location</label>
                        <Select 
                          value={selectedLocation} 
                          onValueChange={setSelectedLocation}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {getUniqueLocations().map((location) => (
                              <SelectItem key={location} value={location}>
                                {location === "all" ? "All Locations" : location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Organization Filter */}
                      <div>
                        <label className="text-sm font-medium block mb-1">Organization</label>
                        <Select 
                          value={selectedOrganization} 
                          onValueChange={setSelectedOrganization}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                          <SelectContent>
                            {getUniqueOrganizations().map((org) => (
                              <SelectItem key={org} value={org}>
                                {org === "all" ? "All Organizations" : org}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Availability Filter */}
                      <div>
                        <label className="text-sm font-medium block mb-1">Availability</label>
                        <Select 
                          value={selectedAvailability} 
                          onValueChange={setSelectedAvailability}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            {availabilityOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option === "all" ? "All Availabilities" : 
                                  option === "available" ? "Available Now" :
                                  option === "partially_available" ? "Partially Available" : "Unavailable"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Additional filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Type Filter for more detailed selection */}
                      <div>
                        <label className="text-sm font-medium block mb-1">Workspace Type</label>
                        <Select 
                          value={selectedType} 
                          onValueChange={setSelectedType}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {workspaceTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type === "all" ? "All Types" : formatWorkspaceType(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Capacity Filter */}
                      <div>
                        <label className="text-sm font-medium block mb-1">Minimum Capacity</label>
                        <Select 
                          value={capacity?.toString() || ""} 
                          onValueChange={(value) => setCapacity(value ? parseInt(value) : undefined)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any capacity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any capacity</SelectItem>
                            <SelectItem value="1">1+ person</SelectItem>
                            <SelectItem value="2">2+ people</SelectItem>
                            <SelectItem value="4">4+ people</SelectItem>
                            <SelectItem value="6">6+ people</SelectItem>
                            <SelectItem value="8">8+ people</SelectItem>
                            <SelectItem value="10">10+ people</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Features section */}
                    <div>
                      <label className="text-sm font-medium block mb-2">Workspace Features</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {commonFeatures.map(feature => {
                          const isSelected = selectedFeatures.includes(feature);
                          return (
                            <Button
                              key={feature}
                              variant={isSelected ? "secondary" : "outline"}
                              size="sm"
                              className="justify-start"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
                                } else {
                                  setSelectedFeatures([...selectedFeatures, feature]);
                                }
                              }}
                            >
                              <span className="w-4 h-4 mr-2 flex items-center justify-center">
                                {isSelected && (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </span>
                              {feature.replace('has_', '').replace('is_', '').replace(/_/g, ' ')}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedType("all");
                        setSelectedLocation("all");
                        setSelectedOrganization("all");
                        setSelectedAvailability("all");
                        setSelectedFeatures([]);
                        setCapacity(undefined);
                      }}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </motion.div>
              )}
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
              disabled={createBookingMutation.isPending || !selectedDate}
            >
              {createBookingMutation.isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  Processing...
                </>
              ) : "Book Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
