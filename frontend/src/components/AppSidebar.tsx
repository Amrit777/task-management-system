
import { Link } from "react-router-dom";
import { LayoutDashboard, ListTodo, Inbox, Calendar, ListFilter, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Board", icon: ListTodo, path: "/board" },
  { name: "Tasks", icon: Inbox, path: "/tasks" },
  { name: "Backlog", icon: ListFilter, path: "/backlog" },
  { name: "Calendar", icon: Calendar, path: "/calendar" },
];

const AppSidebar = () => {
  return (
    <Sidebar variant="floating" collapsible="icon" className="hidden md:flex">
      <SidebarHeader className="flex justify-end p-2">
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
