import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertWorkspace, Workspace } from "@shared/schema";

export function useWorkspaces() {
  return useQuery<Workspace[], Error>({
    queryKey: ["/api/workspaces"],
  });
}

export function useWorkspace(id: number) {
  return useQuery<Workspace, Error>({
    queryKey: ["/api/workspaces", id],
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (workspaceData: InsertWorkspace) => {
      const res = await apiRequest("POST", "/api/workspaces", workspaceData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Workspace created",
        description: `Workspace ${data.name} has been created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}