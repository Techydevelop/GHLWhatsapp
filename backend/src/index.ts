import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import { apiRateLimit } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import subaccountRoutes from './routes/subaccounts';
import sessionRoutes from './routes/sessions';
import messageRoutes from './routes/messages';
import providerRoutes from './routes/provider';
import locationRoutes from './routes/locations';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.gohighlevel.com", "https://services.leadconnectorhq.com"],
      frameSrc: ["'self'", "https://*.gohighlevel.com"],
    },
  },
}));

// CORS middleware
app.use(corsMiddleware);

// Rate limiting
app.use(apiRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Backend up',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/admin', subaccountRoutes);
app.use('/location', sessionRoutes);
app.use('/messages', messageRoutes);
app.use('/provider', providerRoutes);
app.use('/locations', locationRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: any, res: any) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
});

export default app;
