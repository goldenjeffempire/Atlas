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
import EmployeeDashboardPage from "@/pages/employee-dashboard-page";
import GeneralDashboardPage from "@/pages/general-dashboard-page";
import NotificationsPage from "@/pages/notifications-page";
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
      return <EmployeeDashboardPage />;
    case "general":
      return <GeneralDashboardPage />;
    default:
      return <DashboardPage />;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardRouter} />
      <ProtectedRoute path="/workspaces" component={WorkspacesPage} />
      <ProtectedRoute path="/workspaces/:id/book" component={BookingDetailPage} />
      <ProtectedRoute path="/search/:query" component={SearchResultsPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/admin" component={AdminDashboardPage} />
      <ProtectedRoute path="/employee" component={EmployeeDashboardPage} />
      <ProtectedRoute path="/general" component={GeneralDashboardPage} />
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
