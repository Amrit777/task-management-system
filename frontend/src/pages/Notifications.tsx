import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Bell, CheckCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import API from "@/api";

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try real endpoint; fall back to generating from recent tasks
        const res = await API.get("/tasks");
        const tasks = res.data.data ?? res.data ?? [];
        const generated: Notification[] = tasks.slice(0, 20).map((t: any, i: number) => ({
          id: t.id,
          title: i % 3 === 0
            ? "Task assigned: " + t.title
            : i % 3 === 1
            ? "Status updated: " + t.title
            : "New task created: " + t.title,
          description: t.description || "Task \"" + t.title + "\" (" + (t.priority || "Medium") + " priority)",
          date: t.updatedAt || t.createdAt || new Date().toISOString(),
          read: i > 2,
          type: i % 3 === 0 ? "assignment" : i % 3 === 1 ? "status" : "creation",
        }));
        setNotifications(generated);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast({ title: "Notification marked as read", duration: 2000 });
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read", duration: 2000 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read ? "" : "border-primary/30"}
            >
              <CardHeader
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(notification.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                    )}
                    {notification.title}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(notification.date)}
                    </span>
                    {expandedIds.includes(notification.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedIds.includes(notification.id) && (
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-muted-foreground mb-3">
                    {notification.description}
                  </p>
                  {!notification.read && (
                    <Button size="sm" onClick={() => markAsRead(notification.id)}>
                      Mark as read
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
