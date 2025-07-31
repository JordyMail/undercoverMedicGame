import express from 'express';
import cors from 'cors';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import GameManager from './gameManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app without socket setup
function createServer() {
  const app = express();

  // Configure CORS for Express
  const corsOptions = {
    origin: true,
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  // API Routes
  app.get('/api/ping', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  app.get('/api/demo', (req, res) => {
    res.json({
      message: 'Uncoverles Game Server',
      version: '1.0.0',
      features: ['multiplayer', 'real-time', 'medical-diagnosis']
    });
  });

  return app;
}

// Create complete server with socket setup
function createCompleteServer() {
  const app = createServer();

  // Initialize Socket.IO without attaching to HTTP server yet
  const io = new SocketIOServer({
    cors: {
      origin: true,
      credentials: true,
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6,
  });

  // Initialize Game Manager
  const gameManager = new GameManager(io);
  setupSocketHandlers(io, gameManager);

  return { app, io, gameManager };
}

// Create standalone server (for production)
function createStandaloneServer() {
  const app = createServer();
  const server = createHttpServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: true,
      credentials: true,
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6,
  });

  // Initialize Game Manager
  const gameManager = new GameManager(io);
  setupSocketHandlers(io, gameManager);

  return { app, server, io, gameManager };
}

// Setup socket handlers
function setupSocketHandlers(io: SocketIOServer, gameManager: GameManager) {
  // Track connection attempts to prevent spam
  const connectionAttempts = new Map<string, { count: number; lastAttempt: number }>();

  // Clean up old connection attempts every 5 minutes
  setInterval(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - 300000; // 5 minutes

    for (const [ip, data] of connectionAttempts.entries()) {
      if (data.lastAttempt < fiveMinutesAgo) {
        connectionAttempts.delete(ip);
      }
    }

    if (connectionAttempts.size > 0) {
      console.log(`Cleaned up old connection attempts. Active IPs: ${connectionAttempts.size}`);
    }
  }, 300000); // Run every 5 minutes

  // Socket.IO Connection Handling
  io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  const now = Date.now();

  // Rate limiting: max 2 connections per IP per 30 seconds
  const attempts = connectionAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };

  if (now - attempts.lastAttempt < 30000) { // 30 seconds
    attempts.count++;
    if (attempts.count > 2) {
      console.log(`Connection spam detected from ${clientIP}, disconnecting ${socket.id}`);
      socket.emit('error', 'Too many connection attempts. Please wait a moment.');
      socket.disconnect(true);
      return;
    }
  } else {
    attempts.count = 1;
  }

  attempts.lastAttempt = now;
  connectionAttempts.set(clientIP, attempts);

  console.log(`Player connected: ${socket.id} from ${clientIP}`);

  // Game event handlers with error handling
  socket.on('create-room', (playerName: string) => {
    try {
      if (typeof playerName !== 'string') {
        socket.emit('error', 'Invalid player name');
        return;
      }
      gameManager.createRoom(socket, playerName);
    } catch (error) {
      console.error('Error in create-room:', error);
      socket.emit('error', 'Failed to create room');
    }
  });

  socket.on('join-room', (roomCode: string, playerName: string) => {
    try {
      if (typeof roomCode !== 'string' || typeof playerName !== 'string') {
        socket.emit('error', 'Invalid room code or player name');
        return;
      }
      gameManager.joinRoom(socket, roomCode, playerName);
    } catch (error) {
      console.error('Error in join-room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  socket.on('start-game', () => {
    gameManager.startGame(socket);
  });

  socket.on('reveal-role', () => {
    gameManager.revealRole(socket);
  });

  socket.on('send-chat', (message: string) => {
    gameManager.sendChat(socket, message);
  });

  socket.on('submit-answer', (answer: string) => {
    gameManager.submitAnswer(socket, answer);
  });

  socket.on('vote-player', (targetPlayerId: string) => {
    gameManager.votePlayer(socket, targetPlayerId);
  });

  socket.on('submit-final-answer', (answer: any) => {
    gameManager.submitFinalAnswer(socket, answer);
  });

  socket.on('vote-final', (targetPlayerId: string) => {
    gameManager.voteFinal(socket, targetPlayerId);
  });

  socket.on('leave-room', () => {
    gameManager.leaveRoom(socket);
  });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      gameManager.handleDisconnect(socket);
    });
  });
}

// Initialize the main server instance for production
const { app, server, io, gameManager } = createStandaloneServer();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '..', 'spa');
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Only start server if this file is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`🎮 Uncoverles Game Server running on port ${PORT}`);
    console.log(`🔌 Socket.IO server ready for multiplayer connections`);
  });
}

export { createServer, createCompleteServer, createStandaloneServer };
export default app;
