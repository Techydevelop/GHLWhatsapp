import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/database';
import { oauthRateLimit } from '../middleware/rateLimit';
import { OAuthState, MarketplaceTokenResponse } from '../types';

const router = express.Router();

const MARKETPLACE_CLIENT_ID = process.env.MARKETPLACE_CLIENT_ID;
const MARKETPLACE_CLIENT_SECRET = process.env.MARKETPLACE_CLIENT_SECRET;
const MARKETPLACE_REDIRECT_URI = process.env.MARKETPLACE_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!MARKETPLACE_CLIENT_ID || !MARKETPLACE_CLIENT_SECRET || !MARKETPLACE_REDIRECT_URI || !FRONTEND_URL) {
  throw new Error('Missing required OAuth environment variables');
}

/**
 * Initiate OAuth flow with LeadConnector/Marketplace
 * GET /auth/connect
 */
router.get('/connect', oauthRateLimit, (req, res) => {
  try {
    const { return_url } = req.query;
    
    // Create state parameter with return URL
    const state: OAuthState = {
      return_url: return_url as string || `${FRONTEND_URL}/dashboard`,
      user_id: req.query.user_id as string // This should be passed from frontend
    };
    
    const stateParam = encodeURIComponent(JSON.stringify(state));
    
    // Build OAuth URL
    const oauthUrl = new URL('https://marketplace.gohighlevel.com/oauth/chooselocation');
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('client_id', MARKETPLACE_CLIENT_ID);
    oauthUrl.searchParams.set('redirect_uri', MARKETPLACE_REDIRECT_URI);
    oauthUrl.searchParams.set('scope', 'locations.readonly locations.write contacts.readonly contacts.write conversations.read conversations.write businesses.read users.read users.write medias.read medias.write');
    oauthUrl.searchParams.set('state', stateParam);
    
    console.log('Redirecting to OAuth URL:', oauthUrl.toString());
    res.redirect(oauthUrl.toString());
  } catch (error) {
    console.error('OAuth connect error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
});

/**
 * Handle OAuth callback from LeadConnector/Marketplace
 * GET /auth/callback
 */
router.get('/callback', oauthRateLimit, async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('OAuth error:', error);
      return res.status(400).send(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>Error: ${error}</p>
            <script>
              window.opener.postMessage({ type: 'marketplace:error', error: '${error}' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }
    
    if (!code || !state) {
      return res.status(400).send(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>Missing authorization code or state</p>
            <script>
              window.opener.postMessage({ type: 'marketplace:error', error: 'Missing authorization code' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }
    
    // Parse state parameter
    let stateData: OAuthState;
    try {
      stateData = JSON.parse(decodeURIComponent(state as string));
    } catch (error) {
      console.error('Invalid state parameter:', error);
      return res.status(400).send(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>Invalid state parameter</p>
            <script>
              window.opener.postMessage({ type: 'marketplace:error', error: 'Invalid state' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await axios.post<MarketplaceTokenResponse>(
      'https://services.leadconnectorhq.com/oauth/token',
      {
        client_id: MARKETPLACE_CLIENT_ID,
        client_secret: MARKETPLACE_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: MARKETPLACE_REDIRECT_URI
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const { access_token, refresh_token, token_type, expires_in, scope } = tokenResponse.data;
    
    // Get user info from token (we'll need to make an API call to get company info)
    // For now, we'll store the token and let the frontend handle user association
    const accountData = {
      user_id: stateData.user_id || uuidv4(), // Generate UUID if no user_id provided
      company_id: 'unknown', // We'll update this when we get company info
      user_type: 'marketplace',
      access_token,
      refresh_token: refresh_token || null
    };
    
    // Store in database (upsert based on user_id)
    const { data, error: dbError } = await supabaseAdmin
      .from('marketplace_accounts')
      .upsert(accountData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).send(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>Failed to save account data</p>
            <script>
              window.opener.postMessage({ type: 'marketplace:error', error: 'Database error' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }
    
    console.log('OAuth success, account saved:', data.id);
    
    // Return success page that communicates with parent window
    res.send(`
      <html>
        <head>
          <title>OAuth Success</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .success { 
              background: white; 
              padding: 30px; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 400px;
              margin: 0 auto;
            }
            .checkmark { 
              color: #4CAF50; 
              font-size: 48px; 
              margin-bottom: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="success">
            <div class="checkmark">✓</div>
            <h1>Connected Successfully!</h1>
            <p>Your LeadConnector account has been connected.</p>
            <p>This window will close automatically...</p>
          </div>
          <script>
            // Notify parent window of success
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'marketplace:connected', 
                accountId: '${data.id}',
                userId: '${data.user_id}'
              }, '*');
              setTimeout(() => window.close(), 2000);
            } else {
              // Fallback redirect if no parent window
              setTimeout(() => {
                window.location.href = '${stateData.return_url || FRONTEND_URL + '/dashboard'}';
              }, 2000);
            }
          </script>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).send(`
      <html>
        <body>
          <h1>OAuth Error</h1>
          <p>Failed to complete OAuth flow: ${errorMessage}</p>
          <script>
            window.opener.postMessage({ type: 'marketplace:error', error: '${errorMessage}' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
});

/**
 * Get current user's marketplace account
 * GET /auth/account
 */
router.get('/account', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const { data, error } = await supabaseAdmin
      .from('marketplace_accounts')
      .select('*')
      .eq('user_id', user_id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'No marketplace account found' });
      }
      throw error;
    }
    
    // Don't return sensitive tokens
    const { access_token, refresh_token, ...safeData } = data;
    res.json(safeData);
    
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Failed to get account' });
  }
});

export default router;
