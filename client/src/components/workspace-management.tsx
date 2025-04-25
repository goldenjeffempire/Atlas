import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Workspace, InsertWorkspace, workspaces } from "@shared/schema";
import { useCreateWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit, Trash2, ExternalLink, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatWorkspaceType } from "@/lib/utils";
import { motion } from "framer-motion";

// Define the form schema
const workspaceFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum(["desk", "meeting_room", "collaborative_space", "private_office", "focus_pod", "virtual_conference", "phone_booth"]),
  location: z.string().min(3, "Location is required"),
  description: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  imageUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  hourlyRate: z.number().min(0, "Hourly rate cannot be negative"),
  isActive: z.boolean(),
  openingTime: z.string(),
  closingTime: z.string(),
  features: z.record(z.boolean()).optional(),
  organization: z.string().optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

const workspaceTypes = [
  { value: "desk", label: "Desk" },
  { value: "meeting_room", label: "Meeting Room" },
  { value: "private_office", label: "Private Office" },
  { value: "collaborative_space", label: "Collaborative Space" },
  { value: "focus_pod", label: "Focus Pod" },
  { value: "virtual_conference", label: "Virtual Conference" },
  { value: "phone_booth", label: "Phone Booth" },
];

const featureOptions = [
  { id: "has_monitor", label: "Monitor" },
  { id: "has_projector", label: "Projector" },
  { id: "has_whiteboard", label: "Whiteboard" },
  { id: "has_videoconference", label: "Video Conference Equipment" },
  { id: "has_power", label: "Power Outlets" },
  { id: "has_ethernet", label: "Ethernet Connection" },
  { id: "has_natural_light", label: "Natural Light" },
  { id: "is_quiet_zone", label: "Quiet Zone" },
  { id: "is_accessible", label: "Wheelchair Accessible" },
  { id: "has_phone_booth", label: "Phone Booth" },
  { id: "has_kitchen_access", label: "Kitchen Access" },
  { id: "has_air_conditioning", label: "Air Conditioning" },
  { id: "has_ergonomic_chair", label: "Ergonomic Chair" },
  { id: "has_adjustable_desk", label: "Height-Adjustable Desk" },
  { id: "has_presentation_tools", label: "Presentation Tools" },
];

const organizationOptions = [
  { id: "atlas", label: "ATLAS" },
  { id: "partner_org_1", label: "Partner Organization 1" },
  { id: "partner_org_2", label: "Partner Organization 2" },
  { id: "external", label: "External" },
];

export function WorkspaceManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch all workspaces
  const { data: workspaces = [], isLoading } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });
  
  // Create workspace mutation
  const createWorkspaceMutation = useCreateWorkspace();
  
  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: async (workspaceData: { id: number, data: Partial<Workspace> }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/workspaces/${workspaceData.id}`,
        workspaceData.data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Workspace updated",
        description: "The workspace has been updated successfully.",
      });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete workspace mutation
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/workspaces/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Workspace deleted",
        description: "The workspace has been removed successfully.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create form with zod validation
  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: "",
      type: "desk",
      location: "",
      description: "",
      capacity: 1,
      imageUrl: "",
      hourlyRate: 0,
      isActive: true,
      openingTime: "09:00",
      closingTime: "17:00",
      features: featureOptions.reduce((acc, option) => {
        acc[option.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
      organization: "atlas",
    },
  });

  // Handle form submission
  const onSubmit = (values: WorkspaceFormValues) => {
    // Create a clean features object without any undefined or null values
    const features = values.features || {};
    
    const workspaceData = {
      ...values,
      // Add computed fields or transformations
      features: {
        ...features,
        organization: values.organization, // Store organization as a feature
      },
    };
    
    if (selectedWorkspace) {
      // Update existing workspace
      updateWorkspaceMutation.mutate({
        id: selectedWorkspace.id,
        data: workspaceData,
      });
    } else {
      // Create new workspace
      createWorkspaceMutation.mutate(workspaceData as InsertWorkspace);
    }
  };

  // Handle edit workspace
  const handleEditWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    
    // Parse features from workspace
    const workspaceFeatures = workspace.features ? { ...(workspace.features as any) } : {};
    const organization = workspaceFeatures.organization ? String(workspaceFeatures.organization) : "atlas";
    
    // Remove organization from features to avoid duplication
    const features = { ...workspaceFeatures };
    delete features.organization;
    
    // Set form values
    form.reset({
      name: workspace.name,
      type: workspace.type,
      location: workspace.location,
      description: workspace.description || "",
      capacity: workspace.capacity,
      imageUrl: workspace.imageUrl || "",
      hourlyRate: workspace.hourlyRate || 0,
      isActive: workspace.isActive,
      openingTime: workspace.openingTime || "09:00",
      closingTime: workspace.closingTime || "17:00",
      features: features as Record<string, boolean>,
      organization,
    });
    
    setDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setDeleteDialogOpen(true);
  };

  // Handle delete workspace
  const confirmDelete = () => {
    if (selectedWorkspace) {
      deleteWorkspaceMutation.mutate(selectedWorkspace.id);
    }
  };

  // Add new workspace
  const handleAddWorkspace = () => {
    setSelectedWorkspace(null);
    form.reset({
      name: "",
      type: "desk",
      location: "",
      description: "",
      capacity: 1,
      imageUrl: "",
      hourlyRate: 0,
      isActive: true,
      openingTime: "09:00",
      closingTime: "17:00",
      features: featureOptions.reduce((acc, option) => {
        acc[option.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
      organization: "atlas",
    });
    setDialogOpen(true);
  };

  // Filter workspaces
  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesType = filterType === "all" || workspace.type === filterType;
    const matchesSearch = 
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {workspaceTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddWorkspace}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Workspace
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading workspaces...</div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No workspaces found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => (
            <Card key={workspace.id} className="overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {workspace.imageUrl ? (
                  <img 
                    src={workspace.imageUrl} 
                    alt={workspace.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
                <Badge 
                  className="absolute top-2 right-2"
                  variant={workspace.isActive ? "default" : "secondary"}
                >
                  {workspace.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge 
                  className="absolute top-2 left-2"
                  variant="outline"
                >
                  {formatWorkspaceType(workspace.type)}
                </Badge>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {workspace.name}
                  {(workspace.hourlyRate ?? 0) > 0 && (
                    <span className="text-sm font-normal">${workspace.hourlyRate ?? 0}/hr</span>
                  )}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center">
                    {workspace.location}
                    <span className="ml-auto">Capacity: {workspace.capacity}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground line-clamp-2 h-10">
                  {workspace.description || 'No description available'}
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {(() => {
                    if (!workspace.features) return null;
                    
                    const featureEntries = Object.entries(workspace.features as any);
                    const filteredFeatures = featureEntries.filter(
                      ([key, value]) => value === true && key !== 'organization'
                    );
                    
                    const displayFeatures = filteredFeatures.slice(0, 3).map(([key]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key.replace('has_', '').replace('is_', '').replace(/_/g, ' ')}
                      </Badge>
                    ));
                    
                    const moreFeaturesBadge = filteredFeatures.length > 3 ? (
                      <Badge key="more" variant="outline" className="text-xs">
                        +{filteredFeatures.length - 3} more
                      </Badge>
                    ) : null;
                    
                    return <>
                      {displayFeatures}
                      {moreFeaturesBadge}
                    </>;
                  })()}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEditWorkspace(workspace)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`/workspaces/${workspace.id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteConfirm(workspace)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Workspace Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedWorkspace ? `Edit ${selectedWorkspace.name}` : "Create New Workspace"}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkspace 
                ? "Update the details for this workspace." 
                : "Add a new workspace to your organization."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Workspace name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workspaceTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Building, Floor, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Capacity */}
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>
                        URL to an image of this workspace
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Hourly rate */}
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Set to 0 for free workspaces
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Opening/Closing Times */}
                <FormField
                  control={form.control}
                  name="openingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 6).map(hour => (
                              <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? "12:00 PM" : `${hour}:00 AM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="closingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Time</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 12).map(hour => (
                              <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? "12:00 PM" : `${hour}:00 AM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Organization */}
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizationOptions.map(org => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Organization that owns this workspace
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Active Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Make this workspace available for booking
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the workspace details, amenities, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Features */}
              <div className="border rounded-md p-4">
                <h3 className="text-md font-medium mb-4">Workspace Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featureOptions.map((feature) => (
                    <FormField
                      key={feature.id}
                      control={form.control}
                      name={`features.${feature.id}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              {feature.label}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createWorkspaceMutation.isPending || updateWorkspaceMutation.isPending}
                >
                  {(createWorkspaceMutation.isPending || updateWorkspaceMutation.isPending) ? 
                    "Saving..." : selectedWorkspace ? "Update Workspace" : "Create Workspace"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedWorkspace?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteWorkspaceMutation.isPending}
            >
              {deleteWorkspaceMutation.isPending ? "Deleting..." : "Delete Workspace"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}