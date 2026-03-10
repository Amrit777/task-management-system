
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  ListTodo, 
  Inbox, 
  User, 
  Settings, 
  LogOut,
  Menu,
  Calendar,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "./ThemeToggle";
import NotificationPanel from "./NotificationPanel";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Board", icon: ListTodo, path: "/board" },
    { name: "Tasks", icon: Inbox, path: "/tasks" },
    { name: "Backlog", icon: ListFilter, path: "/backlog" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
  ];

  const NavigationLinks = () => (
    <div className="flex space-x-1">
      {navItems.map((item) => (
        <Button key={item.name} variant="ghost" asChild>
          <Link to={item.path} className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        </Button>
      ))}
    </div>
  );

  const SidebarNavigation = () => (
    <div className="flex flex-col space-y-2 mt-8">
      {navItems.map((item) => (
        <Button key={item.name} variant="ghost" asChild className="justify-start">
          <Link to={item.path} className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        </Button>
      ))}
    </div>
  );

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="font-semibold text-xl mb-4">Task Manager</div>
              <SidebarNavigation />
            </SheetContent>
          </Sheet>
          
          <div className="font-semibold text-xl hidden md:block">Task Manager</div>
          
          <nav className="hidden md:block">
            <NavigationLinks />
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <NotificationPanel />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
