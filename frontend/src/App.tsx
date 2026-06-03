import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import AppSidebar from "./components/AppSidebar";
import RealtimeNotifications from "./components/RealtimeNotifications";

// Route components are code-split so the initial bundle stays small.
const Index = lazy(() => import("./pages/Index"));
const Board = lazy(() => import("./pages/Board"));
const Tasks = lazy(() => import("./pages/Tasks"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Backlog = lazy(() => import("./pages/Backlog"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const queryClient = new QueryClient();

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <div className="flex-1 flex">
        <AppSidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RealtimeNotifications />
          <Suspense fallback={<Spinner />}>
            <Routes>
              {/* Public auth routes */}
              <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
              <Route path="/board" element={<ProtectedRoute><AppLayout><Board /></AppLayout></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><AppLayout><Tasks /></AppLayout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
              <Route path="/notifications/:notificationId" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
              <Route path="/backlog" element={<ProtectedRoute><AppLayout><Backlog /></AppLayout></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><AppLayout><Calendar /></AppLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
