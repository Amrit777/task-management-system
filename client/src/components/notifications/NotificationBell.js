// client/src/components/notifications/NotificationBell.js
import React, { useEffect, useState } from 'react';
import socket from '../../socket';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);

  // Listen for notifications from Socket.io
  useEffect(() => {
    socket.on('notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
    });
    return () => socket.off('notification');
  }, []);

  return (
    <div>
      <button>
        Notifications ({notifications.length})
      </button>
      {notifications.length > 0 && (
        <div style={{ background: '#eee', position: 'absolute', right: 0 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: '0.5rem' }}>
            {notifications.map((n, index) => (
              <li key={index}>{n.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
