# WhatsApp + LeadConnector Integration

A production-ready WhatsApp integration with GoHighLevel LeadConnector Marketplace, built with Next.js 14, Express.js, and Supabase.

## 🚀 Features

- **OAuth 2.0 Integration**: Secure authentication with LeadConnector Marketplace
- **Multi-tenant Architecture**: Isolated data with Supabase Row Level Security (RLS)
- **WhatsApp Web Integration**: Real-time messaging using whatsapp-web.js
- **Dedicated QR Pages**: Custom menu links for each GHL location
- **Conversations Provider Bridge**: Seamless GHL ↔ WhatsApp message flow
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Production Ready**: Rate limiting, error handling, and security best practices

## 🏗️ Architecture

### Frontend (Vercel)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions

### Backend (Render/Railway/VPS)
- **Framework**: Express.js with TypeScript
- **WhatsApp**: whatsapp-web.js with LocalAuth
- **Database**: Supabase (PostgreSQL)
- **Security**: JWT middleware, CORS, rate limiting

### Database (Supabase)
- **Tables**: 6 core tables with RLS policies
- **Security**: Multi-tenant isolation
- **Real-time**: Message subscriptions

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- GoHighLevel LeadConnector Marketplace account
- Vercel account (for frontend deployment)
- Render/Railway/VPS account (for backend deployment)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GHLWhatsapp
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Note down your Supabase URL and anon key

### 4. Environment Configuration

#### Backend Environment (`backend/.env`)

```env
# Server Configuration
PORT=10000
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Frontend URL
FRONTEND_URL=https://your-vercel-domain.vercel.app

# LeadConnector/Marketplace OAuth Configuration
MARKETPLACE_CLIENT_ID=your_marketplace_client_id
MARKETPLACE_CLIENT_SECRET=your_marketplace_client_secret
MARKETPLACE_REDIRECT_URI=https://your-backend-domain.com/auth/callback

# Provider Configuration
PROVIDER_ID=your_conversation_provider_id

# WhatsApp Configuration
WA_DATA_DIR=/data/wa

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_key
```

#### Frontend Environment (`frontend/.env.local`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## 🚀 Deployment

### Backend Deployment (Render/Railway/VPS)

#### **Render Deployment Steps:**

1. **Create New Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New** → **Web Service**
   - Connect your GitHub repository
   - Select the repository: `GHLWhatsapp`

2. **Configure Build Settings**:
   - **Build Command**: `npm run build:backend`
   - **Start Command**: `npm run start:backend`
   - **Node Version**: 18 (or latest)

3. **Set Environment Variables**:
   - Add all environment variables from `backend/env.example`
   - Set `MARKETPLACE_REDIRECT_URI` to your Render URL: `https://your-app-name.onrender.com/auth/callback`

2. **Deploy to Railway**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

3. **Deploy to VPS**:
   ```bash
   # Build the application
   cd backend && npm run build
   
   # Use PM2 for process management
   npm install -g pm2
   pm2 start dist/index.js --name "whatsapp-backend"
   ```

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   cd frontend
   vercel --prod
   ```

2. **Set Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`

## 🔧 Configuration

### LeadConnector Marketplace Setup

1. **Create Marketplace App**:
   - Go to [GoHighLevel Marketplace](https://marketplace.gohighlevel.com)
   - Create a new app
   - Set redirect URI: `https://your-backend-domain.com/auth/callback`

2. **Required Scopes**:
   - `locations.readonly` - Read location information
   - `locations.write` - Write location data (for custom fields/values)
   - `contacts.readonly` - Read contact information
   - `contacts.write` - Write contact data
   - `conversations.read` - Read conversation data
   - `conversations.write` - Send/receive messages
   - `businesses.read` - Read business information
   - `users.read` - Read user information
   - `users.write` - Write user data
   - `medias.read` - Read media files
   - `medias.write` - Upload media files

3. **Get Credentials**:
   - Copy `Client ID` and `Client Secret`
   - Add to backend environment variables

### Custom Menu Link Setup

For each GHL location, add a Custom Menu Link:

1. **URL Format**:
   ```
   https://your-backend-domain.com/provider?locationId={locationId}
   ```

2. **Settings**:
   - **Name**: "WhatsApp Integration"
   - **URL**: Use the format above
   - **Open in**: New Tab
   - **Icon**: WhatsApp icon (optional)

## 🧪 Testing

### cURL Tests

#### 1. Connect Subaccount
```bash
curl -X POST https://your-backend-domain.com/admin/subaccounts/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "locationId": "your_ghl_location_id",
    "name": "Main Office"
  }'
```

#### 2. Create WhatsApp Session
```bash
curl -X POST https://your-backend-domain.com/location/your_ghl_location_id/session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Get Session Status
```bash
curl https://your-backend-domain.com/location/your_ghl_location_id/session
```

#### 4. Send Message via Provider
```bash
curl -X POST https://your-backend-domain.com/provider/messages \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "your_ghl_location_id",
    "phone": "+1234567890",
    "message": "Hello from GHL!"
  }'
```

### Frontend Testing

1. **Start Development Server**:
   ```bash
   cd frontend && npm run dev
   ```

2. **Test OAuth Flow**:
   - Navigate to `/integrations/marketplace`
   - Click "Connect Account"
   - Complete OAuth flow

3. **Test Dashboard**:
   - Connect a subaccount
   - Create WhatsApp session
   - Open QR page
   - Send test messages

## 📱 Usage

### 1. Connect Your Account

1. Visit your frontend URL
2. Go to "Integrations" → "Marketplace"
3. Click "Connect Account"
4. Authorize with LeadConnector
5. Select your locations

### 2. Set Up WhatsApp Sessions

1. Go to Dashboard
2. For each location, click "Create WhatsApp Session"
3. Open the QR page (opens in new tab)
4. Scan QR code with WhatsApp Business
5. Wait for "Connected ✅" status

### 3. Use Custom Menu Links

1. In GHL, go to Settings → Custom Menu Links
2. Add new link with URL: `https://your-backend-domain.com/provider?locationId={locationId}`
3. Staff can now access WhatsApp integration directly from GHL

### 4. Send Messages

**From Dashboard**:
- Open chat for any connected location
- Enter recipient phone number
- Type and send messages

**From GHL (Provider Bridge)**:
- Messages sent through GHL Conversations will automatically forward to WhatsApp
- Inbound WhatsApp messages will appear in GHL Conversations

## 🔒 Security Features

- **Row Level Security (RLS)**: All database operations are user-scoped
- **JWT Authentication**: Secure API access with Supabase tokens
- **Rate Limiting**: Prevents abuse on message sending and session creation
- **CORS Protection**: Configured for specific origins
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling without data leaks

## 🐛 Troubleshooting

### Common Issues

1. **WhatsApp Session Not Connecting**:
   - Ensure QR code is scanned within 2 minutes
   - Check if WhatsApp Web is already connected elsewhere
   - Try "Rescan QR Code" button

2. **OAuth Flow Failing**:
   - Verify redirect URI matches exactly
   - Check client ID and secret
   - Ensure popup blockers are disabled

3. **Messages Not Sending**:
   - Verify session status is "ready"
   - Check phone number format (use international format)
   - Review rate limiting (100 messages per 15 minutes)

4. **Database Connection Issues**:
   - Verify Supabase credentials
   - Check RLS policies are enabled
   - Ensure service role key has proper permissions

### Logs and Monitoring

- **Backend Logs**: Check your deployment platform logs
- **Database Logs**: Monitor Supabase dashboard
- **Frontend Errors**: Check browser console and Vercel logs

## 📊 Database Schema

### Core Tables

1. **marketplace_accounts**: OAuth tokens and account info
2. **subaccounts**: GHL location mappings
3. **sessions**: WhatsApp session management
4. **messages**: Message history and metadata
5. **provider_installations**: GHL provider configuration
6. **location_session_map**: Location to session mapping

### RLS Policies

All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
-- Example policy
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);
```

## 🔄 API Endpoints

### Authentication
- `GET /auth/connect` - Initiate OAuth flow
- `GET /auth/callback` - Handle OAuth callback
- `GET /auth/account` - Get account info

### Subaccounts
- `POST /admin/subaccounts/connect` - Connect new location
- `GET /admin/subaccounts` - List user's subaccounts
- `GET /admin/subaccounts/:locationId` - Get specific subaccount
- `PUT /admin/subaccounts/:locationId` - Update subaccount
- `DELETE /admin/subaccounts/:locationId` - Delete subaccount

### Sessions
- `POST /location/:locationId/session` - Create WhatsApp session
- `GET /location/:locationId/session` - Get session status
- `DELETE /location/:locationId/session` - Delete session

### Messages
- `POST /messages/send` - Send direct message
- `GET /messages/:sessionId` - Get session messages
- `GET /messages/subaccount/:subaccountId` - Get subaccount messages
- `GET /messages/conversation/:sessionId/:phoneNumber` - Get conversation

### Provider
- `GET /provider?locationId=<id>` - Dedicated QR page
- `POST /provider/messages` - GHL → WhatsApp bridge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub
4. Contact the development team

## 🔮 Roadmap

- [ ] WhatsApp Business API integration
- [ ] Message templates support
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Webhook integrations
- [ ] Bulk message sending
- [ ] Message scheduling
- [ ] Contact management
- [ ] File sharing improvements
- [ ] Voice message support

---

**Built with ❤️ for the GoHighLevel community**
