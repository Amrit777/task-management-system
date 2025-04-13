// backend/sockets/index.js
module.exports = (server) => {
    const io = require('socket.io')(server, {
      cors: { origin: "*" }, // Adjust origin in production
    });
    
    io.on('connection', (socket) => {
      console.log('New Socket.io connection:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });
    
    return io;
  };
  