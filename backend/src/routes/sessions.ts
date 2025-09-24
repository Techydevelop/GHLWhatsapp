import express from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/database';
import { authenticateToken, verifyLocationOwnership } from '../middleware/auth';
import { sessionRateLimit } from '../middleware/rateLimit';
import { AuthenticatedRequest } from '../middleware/auth';
import { WhatsAppManager } from '../services/whatsapp';

const router = express.Router();

// Store active WhatsApp clients
const activeClients = new Map<string, Client>();

/**
 * Create or restart a WhatsApp session for a location
 * POST /location/:locationId/session
 */
router.post('/:locationId/session', authenticateToken, sessionRateLimit, async (req: AuthenticatedRequest, res) => {
  try {
    const { locationId } = req.params;
    const userId = req.user_id!;
    
    // Verify user owns this location
    const ownsLocation = await verifyLocationOwnership(userId, locationId);
    if (!ownsLocation) {
      return res.status(403).json({ error: 'Access denied to this location' });
    }
    
    // Get subaccount for this location
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id')
      .eq('location_id', locationId)
      .eq('user_id', userId)
      .single();
    
    if (subaccountError) {
      return res.status(404).json({ error: 'Subaccount not found' });
    }
    
    // Check if there's an existing session
    const { data: existingSession } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('subaccount_id', subaccount.id)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let sessionId: string;
    
    if (existingSession) {
      // Update existing session status to initializing
      const { data: updatedSession, error: updateError } = await supabaseAdmin
        .from('sessions')
        .update({ 
          status: 'initializing',
          qr: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSession.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      sessionId = updatedSession.id;
      
      // Destroy existing client if it exists
      const existingClient = activeClients.get(sessionId);
      if (existingClient) {
        await existingClient.destroy();
        activeClients.delete(sessionId);
      }
    } else {
      // Create new session
      const { data: newSession, error: createError } = await supabaseAdmin
        .from('sessions')
        .insert({
          user_id: userId,
          subaccount_id: subaccount.id,
          status: 'initializing'
        })
        .select()
        .single();
      
      if (createError) throw createError;
      sessionId = newSession.id;
    }
    
    // Create WhatsApp client
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `client_${sessionId}`,
        dataPath: process.env.WA_DATA_DIR || '.wwebjs_auth'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });
    
    // Store client reference
    activeClients.set(sessionId, client);
    
    // Set up event handlers
    client.on('qr', async (qr) => {
      try {
        console.log(`QR generated for session ${sessionId}`);
        
        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(qr);
        
        // Update session with QR code
        await supabaseAdmin
          .from('sessions')
          .update({ 
            status: 'qr',
            qr: qrDataUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);
        
        console.log(`QR code saved for session ${sessionId}`);
      } catch (error) {
        console.error('Error saving QR code:', error);
      }
    });
    
    client.on('ready', async () => {
      try {
        console.log(`WhatsApp client ready for session ${sessionId}`);
        
        const info = client.info;
        const phoneNumber = info?.wid?.user || 'Unknown';
        
        // Update session status
        await supabaseAdmin
          .from('sessions')
          .update({ 
            status: 'ready',
            phone_number: phoneNumber,
            qr: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);
        
        // Update location session mapping
        await supabaseAdmin
          .from('location_session_map')
          .upsert({
            user_id: userId,
            subaccount_id: subaccount.id,
            location_id: locationId,
            session_id: sessionId
          }, {
            onConflict: 'location_id',
            ignoreDuplicates: false
          });
        
        console.log(`Session ${sessionId} ready with phone ${phoneNumber}`);
      } catch (error) {
        console.error('Error updating session ready status:', error);
      }
    });
    
    client.on('disconnected', async (reason) => {
      try {
        console.log(`WhatsApp client disconnected for session ${sessionId}, reason: ${reason}`);
        
        // Update session status
        await supabaseAdmin
          .from('sessions')
          .update({ 
            status: 'disconnected',
            qr: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);
        
        // Remove client reference
        activeClients.delete(sessionId);
        
        console.log(`Session ${sessionId} marked as disconnected`);
      } catch (error) {
        console.error('Error updating session disconnected status:', error);
      }
    });
    
    client.on('auth_failure', async (msg) => {
      try {
        console.log(`WhatsApp auth failure for session ${sessionId}: ${msg}`);
        
        // Update session status
        await supabaseAdmin
          .from('sessions')
          .update({ 
            status: 'auth_failure',
            qr: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);
        
        // Remove client reference
        activeClients.delete(sessionId);
        
        console.log(`Session ${sessionId} marked as auth failure`);
      } catch (error) {
        console.error('Error updating session auth failure status:', error);
      }
    });
    
    // Set up message handler for inbound messages
    client.on('message', async (message) => {
      try {
        await WhatsAppManager.handleInboundMessage(message, sessionId, userId, subaccount.id);
      } catch (error) {
        console.error('Error handling inbound message:', error);
      }
    });
    
    // Initialize the client
    await client.initialize();
    
    console.log(`WhatsApp client initialized for session ${sessionId}`);
    
    res.json({ 
      sessionId,
      status: 'initializing',
      message: 'WhatsApp session created successfully'
    });
    
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create WhatsApp session' });
  }
});

/**
 * Get session status for a location
 * GET /location/:locationId/session
 */
router.get('/:locationId/session', async (req, res) => {
  try {
    const { locationId } = req.params;
    
    // Get subaccount for this location (no auth required for provider page)
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id, user_id')
      .eq('location_id', locationId)
      .single();
    
    if (subaccountError) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Get current session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('subaccount_id', subaccount.id)
      .eq('user_id', subaccount.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        return res.json({ 
          sessionId: null,
          status: 'no_session',
          qr: null,
          phone_number: null
        });
      }
      throw sessionError;
    }
    
    res.json({
      sessionId: session.id,
      status: session.status,
      qr: session.qr,
      phone_number: session.phone_number,
      created_at: session.created_at,
      updated_at: session.updated_at
    });
    
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session status' });
  }
});

/**
 * Get all sessions for the current user
 * GET /admin/sessions
 */
router.get('/admin/sessions', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user_id!;
    
    const { data: sessions, error } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        subaccounts!inner(
          id,
          location_id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(sessions);
    
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

/**
 * Delete a session
 * DELETE /location/:locationId/session
 */
router.delete('/:locationId/session', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { locationId } = req.params;
    const userId = req.user_id!;
    
    // Verify user owns this location
    const ownsLocation = await verifyLocationOwnership(userId, locationId);
    if (!ownsLocation) {
      return res.status(403).json({ error: 'Access denied to this location' });
    }
    
    // Get subaccount
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id')
      .eq('location_id', locationId)
      .eq('user_id', userId)
      .single();
    
    if (subaccountError) {
      return res.status(404).json({ error: 'Subaccount not found' });
    }
    
    // Get session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('subaccount_id', subaccount.id)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (sessionError) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Destroy WhatsApp client if it exists
    const client = activeClients.get(session.id);
    if (client) {
      await client.destroy();
      activeClients.delete(session.id);
    }
    
    // Delete session and related records
    await supabaseAdmin
      .from('location_session_map')
      .delete()
      .eq('session_id', session.id);
    
    await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', session.id);
    
    console.log(`Deleted session ${session.id} for location ${locationId}`);
    
    res.json({ message: 'Session deleted successfully' });
    
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
