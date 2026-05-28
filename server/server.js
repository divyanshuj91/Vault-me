import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './models/database.js';
import authRoutes from './routes/auth.js';
import passwordRoutes from './routes/passwords.js';
import auditRoutes from './routes/audit.js';

dotenv.config();

// Initialize the SQLite database
try {
  initDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite dev server (default port 5173) and production build
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/audit', auditRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  Smart Password Manager Backend Running       `);
  console.log(`  Port: ${PORT}                                `);
  console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});
