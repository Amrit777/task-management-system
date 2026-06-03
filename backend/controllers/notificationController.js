// backend/controllers/notificationController.js
// Thin wrapper kept for backwards compatibility. Prefer utils/notify.js
// (notifyUser) for targeted notifications.
const { notifyUser } = require("../utils/notify");

exports.notifyUser = notifyUser;
