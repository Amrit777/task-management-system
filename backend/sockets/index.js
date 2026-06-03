// backend/sockets/index.js
// Authenticated Socket.io layer. Connections must present a valid JWT; each
// client is placed in a private room (`user:<id>`) so notifications can be
// targeted rather than broadcast to everyone.
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config/env");

let io = null;

const init = (server) => {
  io = new Server(server, {
    cors: { origin: config.corsOrigins, credentials: true },
  });

  // Authenticate every socket handshake.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.id;
      return next();
    } catch (err) {
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.on("disconnect", () => {});
  });

  return io;
};

// Emit an event to a specific user's room (no-op if they're offline).
const emitToUser = (userId, event, payload) => {
  if (io && userId != null) io.to(`user:${userId}`).emit(event, payload);
};

module.exports = init;
module.exports.emitToUser = emitToUser;
module.exports.getIO = () => io;
