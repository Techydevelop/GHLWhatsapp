import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user_id?: string;
  body?: any;
  params?: any;
  query?: any;
}

/**
 * Middleware to authenticate requests using Supabase JWT
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Add user_id to request object
    req.user_id = user.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to authenticate requests for provider endpoints (no auth required)
 * This is used for endpoints that will be called by GHL directly
 */
export function providerAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // For provider endpoints, we'll validate the locationId exists
  // and belongs to a valid subaccount
  next();
}

/**
 * Helper function to verify user owns a subaccount
 */
export async function verifySubaccountOwnership(
  userId: string,
  subaccountId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subaccounts')
      .select('id')
      .eq('id', subaccountId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error verifying subaccount ownership:', error);
    return false;
  }
}

/**
 * Helper function to verify user owns a location
 */
export async function verifyLocationOwnership(
  userId: string,
  locationId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subaccounts')
      .select('id')
      .eq('location_id', locationId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error verifying location ownership:', error);
    return false;
  }
}
