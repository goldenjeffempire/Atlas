import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { 
  User as SelectUser, 
  LoginData, 
  InsertUser,
  RegisterUserData 
} from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterUserData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.companyName}!`,
      });
      
      // Navigate to the appropriate dashboard based on role
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else if (user.role === 'employee') {
        window.location.href = '/employee';
      } else {
        window.location.href = '/general';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterUserData) => {
      // Omit confirmPassword as it's only for frontend validation
      const { confirmPassword, ...userDataToSend } = userData;
      const res = await apiRequest("POST", "/api/register", userDataToSend);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to ATLAS, ${user.companyName}!`,
      });
      
      // Navigate to the appropriate dashboard based on role
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else if (user.role === 'employee') {
        window.location.href = '/employee';
      } else {
        window.location.href = '/general';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully",
      });
      // Navigate to the landing page after logout
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Add role-based permission checking
  const hasPermission = (permission: string) => {
    if (!context.user) return false;
    
    const rolePermissions = {
      admin: ["manage_users", "analytics", "system_settings", "all_workspaces", "all_bookings"],
      employee: ["internal_booking", "team_calendar", "department_resources"],
      general: ["basic_booking", "public_spaces", "personal_calendar"],
    };
    
    return rolePermissions[context.user.role]?.includes(permission) ?? false;
  };

  return {
    ...context,
    hasPermission,
    isAdmin: context.user?.role === "admin",
    isEmployee: context.user?.role === "employee",
    isGeneral: context.user?.role === "general"
  };
}
