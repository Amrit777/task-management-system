
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Board from "./pages/Board";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Notifications from "./pages/Notifications";
import Backlog from "./pages/Backlog";
import Calendar from "./pages/Calendar";
import ThemeSwitcher from "./components/ThemeSwitcher";
import AppSidebar from "./components/AppSidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex">
              <AppSidebar />
              <div className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/board" element={<Board />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/notifications/:notificationId" element={<Notifications />} />
                  <Route path="/backlog" element={<Backlog />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
