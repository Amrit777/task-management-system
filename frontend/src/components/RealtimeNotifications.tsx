// frontend/src/components/RealtimeNotifications.tsx
// Mounts once inside the auth context; opens an authenticated socket and turns
// server "notification" events into toasts. Also re-broadcasts them as a window
// event ("tms:notification") so panels can update live.
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { connectSocket, disconnectSocket } from "../socket";

interface ServerNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  taskId: number | null;
  createdAt: string;
}

const RealtimeNotifications = () => {
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user) return;
    const socket = connectSocket(token);

    socket.on("notification", (n: ServerNotification) => {
      toast(n.title || "Notification", { description: n.message });
      window.dispatchEvent(new CustomEvent("tms:notification", { detail: n }));
    });

    return () => {
      socket.off("notification");
      disconnectSocket();
    };
  }, [token, user]);

  return null;
};

export default RealtimeNotifications;
