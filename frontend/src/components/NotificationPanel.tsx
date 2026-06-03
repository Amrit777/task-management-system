import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import API from "@/api";

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/tasks");
        const tasks = res.data.data ?? res.data ?? [];
        const items: Notification[] = tasks.slice(0, 5).map((t: any, i: number) => ({
          id: t.id,
          title: i % 2 === 0 ? "Task: " + t.title : "Updated: " + t.title,
          description: (t.assignedToUser?.name || "Someone") + " - " + (t.priority || "Medium") + " priority",
          date: t.updatedAt || t.createdAt || new Date().toISOString(),
          read: i > 1,
        }));
        setNotifications(items);
      } catch {
        // silent
      }
    };
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={"p-3 border-b last:border-b-0 " + (notification.read ? "" : "bg-accent/30")}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs mt-1"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        <div className="p-2 border-t">
          <Link to="/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;
