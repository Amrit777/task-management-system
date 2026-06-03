// frontend/src/socket.ts — single authenticated Socket.io connection.
import { io, Socket } from "socket.io-client";

// The socket server is the API origin without the trailing /api path.
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:8005/api").replace(
  /\/api\/?$/,
  ""
);

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
