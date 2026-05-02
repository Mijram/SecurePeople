import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { initializeDatabase } from './database/db';
import { seedDatabase } from './seeds/simulatedReports';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import reportRoutes, { setSocketIO } from './routes/reports';

const app = express();
const server = http.createServer(app);

// Socket.IO setup for real-time updates
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'SecurePeople API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`📱 Client disconnected: ${socket.id}`);
  });

  // Client can subscribe to report updates
  socket.on('subscribe_reports', () => {
    socket.join('reports_room');
    console.log(`Client ${socket.id} subscribed to reports`);
  });
});

// Inject Socket.IO into reports router
setSocketIO(io);

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    // Initialize in-memory PostgreSQL database
    await initializeDatabase();

    // Seed with simulated data
    await seedDatabase();

    server.listen(PORT, () => {
      console.log(`\n🚀 SecurePeople API running on port ${PORT}`);
      console.log(`📡 Socket.IO enabled for real-time updates`);
      console.log(`🗄️  Database: In-memory PostgreSQL (pg-mem)`);
      console.log(`\n📋 Available endpoints:`);
      console.log(`   GET  /health`);
      console.log(`   POST /api/auth/register`);
      console.log(`   POST /api/auth/login`);
      console.log(`   GET  /api/users/me`);
      console.log(`   PUT  /api/users/me`);
      console.log(`   GET  /api/reports`);
      console.log(`   GET  /api/reports/:id`);
      console.log(`   POST /api/reports`);
      console.log(`   GET  /api/reports/user/my\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
