const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config/env');
const { authenticateSocket } = require('./middleware/socketAuth');
const { setIO } = require('./services/socketService');

const server = http.createServer(app);

// Initialize Socket.IO with CORS & Auth
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true
  }
});

// Authenticate WebSocket connections
io.use(authenticateSocket);

io.on('connection', (socket) => {
  const user = socket.user;

  // Automatically join authorized user & department rooms
  socket.join(`user_${user.id}`);
  socket.join(`dept_${user.department_id}`);
  socket.join(`role_${user.role}`);

  console.log(`[WebSocket] Connected: ${user.full_name} (${user.role}) - Joined user_${user.id}`);

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Disconnected: ${user.full_name}`);
  });
});

setIO(io);

server.listen(config.PORT, () => {
  console.log(`====================================================`);
  console.log(`  VESA Enterprise Business Workflow Platform API`);
  console.log(`  Server running on http://localhost:${config.PORT}`);
  console.log(`  WebSocket Server active via Socket.IO`);
  console.log(`  Environment: ${config.NODE_ENV}`);
  console.log(`====================================================`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down gracefully...', err);
  server.close(() => {
    process.exit(1);
  });
});
