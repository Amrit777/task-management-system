// backend/controllers/notificationController.js
// Simple controller to send notifications via Socket.io
exports.sendNotification = (io, data) => {
    io.emit('notification', data);
  };
  