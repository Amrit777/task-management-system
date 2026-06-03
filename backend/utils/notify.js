// backend/utils/notify.js
// Builds and dispatches a real-time notification to a single user.
const { emitToUser } = require("../sockets");

const notifyUser = (userId, { type, title, message, taskId }) => {
  if (userId == null) return;
  emitToUser(userId, "notification", {
    id: `n_${taskId || "x"}_${Date.now()}`,
    type,
    title,
    message,
    taskId: taskId ?? null,
    createdAt: new Date().toISOString(),
    read: false,
  });
};

module.exports = { notifyUser };
