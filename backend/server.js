// Simple server.js for Render deployment
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

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
const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl) {
  app.use(cors({
    origin: [frontendUrl, 'https://*.gohighlevel.com'],
    credentials: true
  }));
} else {
  app.use(cors());
}

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

// Basic API endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Placeholder endpoints for development
app.get('/auth/connect', (req, res) => {
  res.json({ message: 'OAuth endpoint - configure with your LeadConnector credentials' });
});

app.get('/auth/callback', (req, res) => {
  res.json({ message: 'OAuth callback endpoint - configure with your LeadConnector credentials' });
});

app.get('/admin/subaccounts', (req, res) => {
  res.json({ message: 'Subaccounts endpoint - configure with your database' });
});

app.get('/location/:locationId/session', (req, res) => {
  res.json({ 
    message: 'Session endpoint - configure with your WhatsApp integration',
    locationId: req.params.locationId 
  });
});

app.get('/provider', (req, res) => {
  res.json({ 
    message: 'Provider endpoint - configure with your WhatsApp integration',
    locationId: req.query.locationId 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
});

module.exports = app;
