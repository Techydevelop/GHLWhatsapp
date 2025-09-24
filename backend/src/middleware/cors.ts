import { Request, Response, NextFunction } from 'express';

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  throw new Error('FRONTEND_URL environment variable is required');
}

/**
 * CORS middleware configuration
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  
  // Allow requests from frontend URL
  if (origin === frontendUrl) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Allow requests from GHL (for provider endpoints)
  if (origin && origin.includes('gohighlevel.com')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Allow requests from localhost for development
  if (process.env.NODE_ENV === 'development' && origin && origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
}
