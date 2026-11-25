import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/database.js';
import { registerChatSockets } from './sockets/chat.socket.js';
import { setNotificationSocketIO } from './modules/notifications/notifications.service.js';

const server = http.createServer(app);

// Initialize Socket.IO with strict CORS
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});

// Register notification service socket
setNotificationSocketIO(io);

// Register socket handlers
registerChatSockets(io);

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`🚀 DRIVAIR API server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`📡 Health check available at: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`💬 Socket.IO real-time server connected`);
  });
};

startServer();
