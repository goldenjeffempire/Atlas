import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LayoutGrid, AlignJustify, Filter, ArrowLeft } from "lucide-react";
import WorkspaceCard from "@/components/workspace-card";
import { Workspace } from "@shared/schema";
import { useCreateBooking } from "@/hooks/use-booking";
import { motion } from "framer-motion";
import { formatWorkspaceType } from "@/lib/utils";

export default function SearchResultsPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/search/:query");
  const searchQuery = params?.query || "";
  const decodedQuery = decodeURIComponent(searchQuery);
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Fetch all workspaces
  const { data: workspaces, isLoading, error } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });
  
  // Filter workspaces based on search and type
  const filteredWorkspaces = workspaces?.filter((workspace) => {
    const matchesSearch = 
      workspace.name.toLowerCase().includes(decodedQuery.toLowerCase()) ||
      workspace.location.toLowerCase().includes(decodedQuery.toLowerCase());
    
    const matchesType = 
      selectedType === "all" || workspace.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  const handleBookNow = (workspace: Workspace) => {
    navigate(`/workspaces/${workspace.id}/book`);
  };
  
  const handleBack = () => {
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
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="mr-3"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Search Results</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredWorkspaces?.length || 0} results for "{decodedQuery}"
                </p>
              </div>
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
                    defaultValue={decodedQuery}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        navigate(`/search/${encodeURIComponent(target.value)}`);
                      }
                    }}
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
                No workspaces found matching "{decodedQuery}".
                <div className="mt-4">
                  <Button onClick={handleBack}>
                    View All Workspaces
                  </Button>
                </div>
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
    </div>
  );
}