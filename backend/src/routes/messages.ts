import express from 'express';
import { supabaseAdmin } from '../config/database';
import { authenticateToken, verifySubaccountOwnership } from '../middleware/auth';
import { messageRateLimit } from '../middleware/rateLimit';
import { WhatsAppManager } from '../services/whatsapp';
import { normalizeToE164 } from '../utils/phone';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Send a direct message via WhatsApp
 * POST /messages/send
 */
router.post('/send', authenticateToken, messageRateLimit, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId, to, body, mediaUrl, mediaMime } = req.body;
    const userId = req.user_id!;
    
    if (!sessionId || !to) {
      return res.status(400).json({ error: 'sessionId and to are required' });
    }
    
    if (!body && !mediaUrl) {
      return res.status(400).json({ error: 'body or mediaUrl is required' });
    }
    
    // Verify user owns this session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        subaccounts!inner(
          id,
          user_id
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();
    
    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    if (session.status !== 'ready') {
      return res.status(400).json({ error: 'WhatsApp session is not ready' });
    }
    
    // Get WhatsApp client
    const client = WhatsAppManager.getClient(sessionId);
    if (!client) {
      return res.status(500).json({ error: 'WhatsApp client not available' });
    }
    
    // Normalize phone number
    const normalizedTo = normalizeToE164(to);
    
    // Send message via WhatsApp
    const waMessage = await WhatsAppManager.sendMessage(
      client,
      normalizedTo,
      body,
      mediaUrl,
      mediaMime
    );
    
    // Save message to database
    const { data: savedMessage, error: saveError } = await supabaseAdmin
      .from('messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        subaccount_id: session.subaccount_id,
        from_number: session.phone_number || 'unknown',
        to_number: normalizedTo,
        body,
        media_url: mediaUrl,
        media_mime: mediaMime,
        direction: 'out'
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('Error saving outbound message:', saveError);
      // Don't fail the request, message was sent successfully
    }
    
    res.json({
      success: true,
      messageId: waMessage.id._serialized,
      savedMessageId: savedMessage?.id,
      recipient: normalizedTo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get messages for a session
 * GET /messages/:sessionId
 */
router.get('/:sessionId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user_id!;
    
    // Verify user owns this session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select(`
        id,
        subaccounts!inner(
          id,
          user_id
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();
    
    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    // Get messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (messagesError) throw messagesError;
    
    res.json({
      messages: messages || [],
      count: messages?.length || 0,
      hasMore: (messages?.length || 0) === Number(limit)
    });
    
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * Get messages for a subaccount (all sessions)
 * GET /messages/subaccount/:subaccountId
 */
router.get('/subaccount/:subaccountId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { subaccountId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user_id!;
    
    // Verify user owns this subaccount
    const ownsSubaccount = await verifySubaccountOwnership(userId, subaccountId);
    if (!ownsSubaccount) {
      return res.status(403).json({ error: 'Access denied to this subaccount' });
    }
    
    // Get messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sessions!inner(
          id,
          phone_number
        )
      `)
      .eq('subaccount_id', subaccountId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (messagesError) throw messagesError;
    
    res.json({
      messages: messages || [],
      count: messages?.length || 0,
      hasMore: (messages?.length || 0) === Number(limit)
    });
    
  } catch (error) {
    console.error('Get subaccount messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * Get conversation between two numbers
 * GET /messages/conversation/:sessionId/:phoneNumber
 */
router.get('/conversation/:sessionId/:phoneNumber', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId, phoneNumber } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    const userId = req.user_id!;
    
    // Verify user owns this session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select(`
        id,
        subaccounts!inner(
          id,
          user_id
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();
    
    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    // Normalize phone number for search
    const normalizedPhone = normalizeToE164(phoneNumber);
    
    // Get conversation messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .or(`from_number.eq.${normalizedPhone},to_number.eq.${normalizedPhone}`)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (messagesError) throw messagesError;
    
    res.json({
      messages: messages || [],
      count: messages?.length || 0,
      hasMore: (messages?.length || 0) === Number(limit),
      phoneNumber: normalizedPhone
    });
    
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

/**
 * Mark messages as read (placeholder for future implementation)
 * PUT /messages/read
 */
router.put('/read', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user_id!;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: 'messageIds array is required' });
    }
    
    // TODO: Implement read status tracking
    // For now, just return success
    
    res.json({ 
      success: true, 
      readCount: messageIds.length,
      message: 'Read status updated (placeholder implementation)'
    });
    
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router;
