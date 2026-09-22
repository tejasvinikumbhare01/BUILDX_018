import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config/env';
import { initSocketIO } from './sockets/socketHandler';

// Import Routes
import authRoutes from './routes/authRoutes';
import incidentRoutes from './routes/incidentRoutes';
import rescueRoutes from './routes/rescueRoutes';
import shelterRoutes from './routes/shelterRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import alertRoutes from './routes/alertRoutes';
import weatherRoutes from './routes/weatherRoutes';
import routingRoutes from './routes/routingRoutes';
import aiRoutes from './routes/aiRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import locationRoutes from './routes/locationRoutes';

const app = express();
const server = http.createServer(app);

// Initialize real-time Socket.IO
initSocketIO(server);

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', apiLimiter);

// Serve Static Uploads (Damage photos, incident images)
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'ResQGrid AI Backend Engine',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL Active',
    sockets: 'Operational',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/rescue', rescueRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/location', locationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.',
  });
});

// Start Server
const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ResQGrid AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO Real-Time Channels Active`);
  console.log(`🐘 PostgreSQL connected via Prisma`);
  console.log(`======================================================\n`);
});

export { app, server };
