// backend/server.js
require('dotenv').config();
const http = require('http');
const app = require('./app');
const socketInit = require('./sockets');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketInit(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
