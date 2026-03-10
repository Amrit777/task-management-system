
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "New task assigned",
    description: "You have been assigned a new task: 'Setup API integration'",
    date: "2023-05-10T10:00:00",
    read: false
  },
  {
    id: 2,
    title: "Task status update",
    description: "Task 'Design new dashboard' was moved to 'In Progress'",
    date: "2023-05-09T15:30:00",
    read: false
  },
  {
    id: 3,
    title: "Comment on task",
    description: "Mike commented on 'Implement authentication'",
    date: "2023-05-09T11:45:00",
    read: true
  },
  {
    id: 4,
    title: "Sprint starting soon",
    description: "Sprint 'Q2 Features' will start tomorrow",
    date: "2023-05-08T09:15:00",
    read: true
  },
  {
    id: 5,
    title: "Task completed",
    description: "Task 'Setup project repository' was marked as complete",
    date: "2023-05-07T16:20:00",
    read: true
  },
  {
    id: 6,
    title: "New team member",
    description: "Emma has joined the team",
    date: "2023-05-06T14:00:00",
    read: true
  },
  {
    id: 7,
    title: "Project deadline updated",
    description: "The project deadline has been extended by 1 week",
    date: "2023-05-05T11:30:00",
    read: true
  },
  {
    id: 8,
    title: "Meeting reminder",
    description: "Weekly standup in 30 minutes",
    date: "2023-05-04T09:30:00",
    read: true
  },
  {
    id: 9,
    title: "Task priority change",
    description: "Task 'Fix navigation bug' priority changed to 'High'",
    date: "2023-05-03T15:45:00",
    read: true
  },
  {
    id: 10,
    title: "New project created",
    description: "A new project 'Mobile App Redesign' has been created",
    date: "2023-05-02T10:15:00",
    read: true
  }
];

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { toast } = useToast();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    toast({
      title: "Notification marked as read",
      duration: 2000,
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          </div>
        </div>
        <div className="max-h-80 overflow-auto">
          {notifications.slice(0, 10).map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 border-b last:border-b-0 ${notification.read ? '' : 'bg-accent/30'}`}
            >
              <div className="flex justify-between">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
              <div className="flex justify-between items-center mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => markAsRead(notification.id)}
                >
                  Mark as read
                </Button>
                <Link to={`/notifications/${notification.id}`} onClick={() => setOpen(false)}>
                  <Button variant="link" size="sm" className="text-xs p-0 h-auto">View</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t">
          <Link to="/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full">View all notifications</Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;
