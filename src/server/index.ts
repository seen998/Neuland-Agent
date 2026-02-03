import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG, validateConfig } from './constants/config.js';
import { SessionManager } from './services/sessionManager.js';
import { OpenRouterService } from './services/openrouter.js';

// Import routes
import sessionRoutes from './routes/session.js';
import chatRoutes from './routes/chat.js';
import tabRoutes from './routes/tabs.js';
import configRoutes from './routes/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: CONFIG.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/session', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tabs', tabRoutes);
app.use('/api/config', configRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    sessions: SessionManager.getSessionCount(),
    environment: CONFIG.NODE_ENV
  });
});

// Serve static files in production
if (CONFIG.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../dist/client');
  app.use(express.static(clientDistPath));
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: CONFIG.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
async function startServer() {
  // Validate configuration
  validateConfig();
  
  // Test OpenRouter connection
  const openRouterConnected = await OpenRouterService.testConnection();
  if (openRouterConnected) {
    console.log('✓ OpenRouter API connection successful');
  } else {
    console.warn('⚠ OpenRouter API connection failed. AI features will not work.');
    if (!CONFIG.OPENROUTER_API_KEY) {
      console.warn('  No OPENROUTER_API_KEY configured');
    }
  }
  
  app.listen(CONFIG.PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           AI Coaching Agent Server Started                   ║
╠══════════════════════════════════════════════════════════════╣
║  Port:        ${CONFIG.PORT.toString().padEnd(47)}║
║  Environment: ${CONFIG.NODE_ENV.padEnd(47)}║
║  OpenRouter:  ${(openRouterConnected ? 'Connected' : 'Not Connected').padEnd(47)}║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
}

startServer().catch(console.error);

export default app;
