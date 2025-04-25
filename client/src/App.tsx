import React, { useState, useEffect } from "react";
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
import { ChatWidget } from "./components/chat-widget";
import { ErrorBoundary } from '@/components/error-boundary';

// Role-based dashboard routing
function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <DashboardPage />;

  // Role-specific dashboard routing with feature flags
  switch (user.role) {
    case "admin":
      return <AdminDashboardPage features={{
        manageUsers: true,
        analytics: true,
        workspaceManagement: true,
        advancedBooking: true,
        systemSettings: true
      }} />;
    case "employee":
      return <EnhancedEmployeeDashboardPage features={{
        internalBooking: true,
        departmentView: true,
        resourceAccess: true,
        teamCalendar: true
      }} />;
    case "general":
      return <GeneralDashboardPage features={{
        basicBooking: true,
        publicSpaces: true,
        personalCalendar: true
      }} />;
    case "learner":
      return <GeneralDashboardPage features={{
        basicBooking: true,
        publicSpaces: true,
        personalCalendar: true,
        learningResources: true
      }} />;
    default:
      return <DashboardPage />;
  }
}

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Redirect user to appropriate dashboard after login if they're on the landing page
  useEffect(() => {
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

      <Route path="/about" component={AboutPage} />
      <Route path="/support" component={SupportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ErrorBoundary>
      <div className={darkMode ? 'dark' : ''}>
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
      </div>
    </ErrorBoundary>
  );
}

// Simplified chat widget container that shows for all users
function ChatWidgetContainer() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Only show chat widget for authenticated users, hide on landing
  if (!user || location === "/") return null;

  return <ChatWidget />;
}

export default App;


// Placeholder components -  Replace with actual implementations
function AboutPage() { return <div>About Us</div> }
function SupportPage() { return <div>Support</div> }