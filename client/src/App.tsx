import React, { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import WorkspacesPage from "@/pages/workspaces-page";
import SearchResultsPage from "@/pages/search-results-page";
import BookingDetailPage from "@/pages/booking-detail-page";
import LandingPage from "@/pages/landing-page";
import AdminDashboardPage from "@/pages/admin-dashboard-page";
import EnhancedEmployeeDashboardPage from "@/pages/enhanced-employee-dashboard-page";
import GeneralDashboardPage from "@/pages/general-dashboard-page";
import NotificationsPage from "@/pages/notifications-page";
import ProfilePage from "@/pages/profile-page";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ChatWidget } from "./components/chat/chat-widget";

// Role-based dashboard routing
function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) return <DashboardPage />;
  
  switch (user.role) {
    case "admin":
      return <AdminDashboardPage />;
    case "employee":
      return <EnhancedEmployeeDashboardPage />;
    case "general":
      return <GeneralDashboardPage />;
    case "learner":
      // For now, reuse the general dashboard for learners until we create a learner-specific view
      return <GeneralDashboardPage />;
    default:
      return <DashboardPage />;
  }
}

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Redirect user to appropriate dashboard after login if they're on the landing page
  React.useEffect(() => {
    if (user && location === "/") {
      window.location.href = "/dashboard";
    }
  }, [user, location]);
  
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardRouter} />
      
      {/* Common protected routes for all users */}
      <ProtectedRoute path="/workspaces" component={WorkspacesPage} />
      <ProtectedRoute path="/workspaces/:id/book" component={BookingDetailPage} />
      <ProtectedRoute path="/search/:query" component={SearchResultsPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      
      {/* Role-specific routes */}
      <ProtectedRoute 
        path="/admin" 
        component={() => {
          if (user?.role !== "admin") return <NotFound />;
          return <AdminDashboardPage />;
        }} 
      />
      <ProtectedRoute 
        path="/employee" 
        component={() => {
          if (user?.role !== "employee") return <NotFound />;
          return <EnhancedEmployeeDashboardPage />;
        }} 
      />
      <ProtectedRoute 
        path="/general" 
        component={() => {
          if (user?.role !== "general" && user?.role !== "learner") return <NotFound />;
          return <GeneralDashboardPage />;
        }} 
      />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          {/* Chat widget is rendered here when authenticated */}
          <ChatWidgetContainer />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Simplified chat widget container that shows for all users
function ChatWidgetContainer() {
  const [location] = useLocation();
  // Hide chat widget on landing page
  if (location === "/") return null;
  
  return <ChatWidget />;
}

export default App;
