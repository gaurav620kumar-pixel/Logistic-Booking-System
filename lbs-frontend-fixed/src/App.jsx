import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VenuesPage from "./pages/VenuesPage";
import BookVenuePage from "./pages/BookVenuePage";
import MyBookingsPage from "./pages/MyBookingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import RequestsPage from "./pages/RequestsPage";
import EquipmentRequestsPage from "./pages/EquipmentRequestsPage";
import AllBookingsPage from "./pages/AllBookingsPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import ManageVenuesPage from "./pages/ManageVenuesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard"         element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/venues"            element={<ProtectedRoute><VenuesPage /></ProtectedRoute>} />
      <Route path="/book"              element={<ProtectedRoute><BookVenuePage /></ProtectedRoute>} />
      <Route path="/my-bookings"       element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/notifications"     element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/requests"          element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
      <Route path="/equipment-requests" element={<ProtectedRoute><EquipmentRequestsPage /></ProtectedRoute>} />
      <Route path="/all-bookings"      element={<ProtectedRoute><AllBookingsPage /></ProtectedRoute>} />
      <Route path="/manage-users"      element={<ProtectedRoute><ManageUsersPage /></ProtectedRoute>} />
      <Route path="/manage-venues"     element={<ProtectedRoute><ManageVenuesPage /></ProtectedRoute>} />
      <Route path="/reports"           element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/settings"          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*"                  element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
