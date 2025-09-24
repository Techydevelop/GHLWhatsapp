import express from 'express';
import { supabaseAdmin } from '../config/database';
import { WhatsAppManager } from '../services/whatsapp';
import { normalizeToE164 } from '../utils/phone';
import { GHLMessagePayload } from '../types';

const router = express.Router();

/**
 * Dedicated QR page for GHL Custom Menu Link
 * GET /provider?locationId=<id>
 */
router.get('/', async (req, res) => {
  try {
    const { locationId } = req.query;
    
    if (!locationId) {
      return res.status(400).send(`
        <html>
          <head>
            <title>WhatsApp Integration</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .error { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; color: #e74c3c; }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>❌ Error</h1>
              <p>Location ID is required</p>
            </div>
          </body>
        </html>
      `);
    }
    
    // Verify location exists
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id, name, user_id')
      .eq('location_id', locationId)
      .single();
    
    if (subaccountError || !subaccount) {
      return res.status(404).send(`
        <html>
          <head>
            <title>WhatsApp Integration</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .error { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; color: #e74c3c; }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>❌ Location Not Found</h1>
              <p>Location ID "${locationId}" not found or not connected.</p>
            </div>
          </body>
        </html>
      `);
    }
    
    // Get current session status
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('subaccount_id', subaccount.id)
      .eq('user_id', subaccount.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const sessionStatus = session?.status || 'no_session';
    const qrCode = session?.qr;
    const phoneNumber = session?.phone_number;
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WhatsApp Integration - ${subaccount.name || locationId}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container { 
              background: white; 
              border-radius: 16px; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              padding: 40px; 
              max-width: 500px; 
              width: 100%;
              text-align: center;
            }
            .header { margin-bottom: 30px; }
            .header h1 { color: #2d3748; margin-bottom: 10px; font-size: 28px; }
            .header p { color: #718096; font-size: 16px; }
            .status { 
              padding: 20px; 
              border-radius: 12px; 
              margin: 20px 0; 
              font-weight: 600;
            }
            .status.ready { background: #f0fff4; color: #22543d; border: 2px solid #9ae6b4; }
            .status.qr { background: #fef5e7; color: #744210; border: 2px solid #f6e05e; }
            .status.initializing { background: #ebf8ff; color: #2a4365; border: 2px solid #90cdf4; }
            .status.disconnected, .status.auth_failure { background: #fed7d7; color: #742a2a; border: 2px solid #fc8181; }
            .status.no_session { background: #f7fafc; color: #4a5568; border: 2px solid #e2e8f0; }
            .qr-code { margin: 20px 0; }
            .qr-code img { max-width: 100%; border-radius: 8px; }
            .phone { font-size: 18px; font-weight: 600; color: #2d3748; margin: 10px 0; }
            .button { 
              background: #4299e1; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 8px; 
              font-size: 16px; 
              font-weight: 600; 
              cursor: pointer; 
              transition: all 0.2s;
              margin: 10px;
              text-decoration: none;
              display: inline-block;
            }
            .button:hover { background: #3182ce; transform: translateY(-1px); }
            .button.secondary { background: #718096; }
            .button.secondary:hover { background: #4a5568; }
            .loading { display: none; }
            .loading.show { display: inline-block; }
            .instructions { 
              background: #f7fafc; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              text-align: left;
              font-size: 14px;
              color: #4a5568;
            }
            .instructions h3 { margin-bottom: 10px; color: #2d3748; }
            .instructions ol { padding-left: 20px; }
            .instructions li { margin-bottom: 5px; }
            .auto-refresh { font-size: 12px; color: #a0aec0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📱 WhatsApp Integration</h1>
              <p>${subaccount.name || `Location ${locationId}`}</p>
            </div>
            
            <div class="status ${sessionStatus}">
              ${this.getStatusMessage(sessionStatus, phoneNumber)}
            </div>
            
            ${qrCode ? `
              <div class="qr-code">
                <img src="${qrCode}" alt="WhatsApp QR Code">
              </div>
              <div class="instructions">
                <h3>📋 How to connect:</h3>
                <ol>
                  <li>Open WhatsApp on your phone</li>
                  <li>Tap Menu or Settings</li>
                  <li>Tap "Linked Devices"</li>
                  <li>Tap "Link a Device"</li>
                  <li>Point your phone at this QR code</li>
                </ol>
              </div>
            ` : ''}
            
            <div>
              <button class="button" onclick="createSession()" id="createBtn">
                ${sessionStatus === 'no_session' ? 'Create Session' : 'Rescan QR Code'}
              </button>
              <button class="button secondary" onclick="refreshStatus()" id="refreshBtn">
                Refresh Status
              </button>
            </div>
            
            <div class="auto-refresh">
              Status updates automatically every 2 seconds
            </div>
          </div>
          
          <script>
            let refreshInterval;
            
            function createSession() {
              const btn = document.getElementById('createBtn');
              const originalText = btn.textContent;
              btn.textContent = 'Creating...';
              btn.disabled = true;
              
              fetch('/location/${locationId}/session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              .then(response => response.json())
              .then(data => {
                if (data.error) {
                  alert('Error: ' + data.error);
                } else {
                  location.reload();
                }
              })
              .catch(error => {
                alert('Error: ' + error.message);
              })
              .finally(() => {
                btn.textContent = originalText;
                btn.disabled = false;
              });
            }
            
            function refreshStatus() {
              location.reload();
            }
            
            // Auto-refresh every 2 seconds
            refreshInterval = setInterval(() => {
              fetch('/location/${locationId}/session')
                .then(response => response.json())
                .then(data => {
                  if (data.status !== '${sessionStatus}') {
                    location.reload();
                  }
                })
                .catch(error => {
                  console.error('Auto-refresh error:', error);
                });
            }, 2000);
            
            // Stop auto-refresh when page is hidden
            document.addEventListener('visibilitychange', function() {
              if (document.hidden) {
                clearInterval(refreshInterval);
              } else {
                refreshInterval = setInterval(() => {
                  fetch('/location/${locationId}/session')
                    .then(response => response.json())
                    .then(data => {
                      if (data.status !== '${sessionStatus}') {
                        location.reload();
                      }
                    })
                    .catch(error => {
                      console.error('Auto-refresh error:', error);
                    });
                }, 2000);
              }
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Provider page error:', error);
    res.status(500).send(`
      <html>
        <head>
          <title>WhatsApp Integration - Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Server Error</h1>
            <p>An error occurred while loading the page.</p>
          </div>
        </body>
      </html>
    `);
  }
});

/**
 * Get status message for display
 */
function getStatusMessage(status: string, phoneNumber?: string): string {
  switch (status) {
    case 'ready':
      return `✅ Connected${phoneNumber ? ` (${phoneNumber})` : ''}`;
    case 'qr':
      return '📱 Scan QR Code with WhatsApp';
    case 'initializing':
      return '⏳ Initializing WhatsApp...';
    case 'disconnected':
      return '❌ Disconnected - Click "Rescan QR Code"';
    case 'auth_failure':
      return '❌ Authentication Failed - Click "Rescan QR Code"';
    case 'no_session':
      return '📱 No WhatsApp session - Click "Create Session"';
    default:
      return `❓ Status: ${status}`;
  }
}

/**
 * Handle outbound messages from GHL
 * POST /provider/messages
 */
router.post('/messages', async (req, res) => {
  try {
    const payload: GHLMessagePayload = req.body;
    const { locationId, contactId, phone, message, attachments } = payload;
    
    if (!locationId) {
      return res.status(400).json({ error: 'locationId is required' });
    }
    
    if (!phone && !contactId) {
      return res.status(400).json({ error: 'phone or contactId is required' });
    }
    
    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'message or attachments is required' });
    }
    
    // Get session for this location
    const { data: locationSession, error: locationError } = await supabaseAdmin
      .from('location_session_map')
      .select(`
        session_id,
        subaccount_id,
        user_id,
        sessions!inner(
          id,
          status,
          phone_number
        )
      `)
      .eq('location_id', locationId)
      .single();
    
    if (locationError || !locationSession) {
      return res.status(404).json({ error: 'No active WhatsApp session found for this location' });
    }
    
    if (locationSession.sessions.status !== 'ready') {
      return res.status(400).json({ error: 'WhatsApp session is not ready' });
    }
    
    // Get WhatsApp client
    const client = WhatsAppManager.getClient(locationSession.session_id);
    if (!client) {
      return res.status(500).json({ error: 'WhatsApp client not available' });
    }
    
    // Determine recipient phone number
    let recipientPhone = phone;
    if (!recipientPhone && contactId) {
      // TODO: Get phone number from GHL contact API using contactId
      // For now, we'll require phone to be provided
      return res.status(400).json({ error: 'phone is required when contactId is provided' });
    }
    
    if (!recipientPhone) {
      return res.status(400).json({ error: 'phone is required' });
    }
    
    // Normalize phone number
    const normalizedPhone = normalizeToE164(recipientPhone);
    
    // Send message(s)
    const sentMessages = [];
    
    // Send text message if provided
    if (message) {
      const waMessage = await WhatsAppManager.sendMessage(
        client,
        normalizedPhone,
        message
      );
      sentMessages.push(waMessage);
    }
    
    // Send media attachments if provided
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const waMessage = await WhatsAppManager.sendMessage(
          client,
          normalizedPhone,
          undefined,
          attachment.url,
          attachment.type
        );
        sentMessages.push(waMessage);
      }
    }
    
    // Save outbound messages to database
    for (const waMessage of sentMessages) {
      await supabaseAdmin
        .from('messages')
        .insert({
          session_id: locationSession.session_id,
          user_id: locationSession.user_id,
          subaccount_id: locationSession.subaccount_id,
          from_number: locationSession.sessions.phone_number || 'unknown',
          to_number: normalizedPhone,
          body: message,
          direction: 'out'
        });
    }
    
    // Return provider-friendly response
    res.json({
      success: true,
      messageId: sentMessages[0]?.id?._serialized || 'unknown',
      altId: sentMessages[0]?.id?._serialized || 'unknown',
      sentCount: sentMessages.length,
      recipient: normalizedPhone
    });
    
  } catch (error) {
    console.error('Provider message error:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
