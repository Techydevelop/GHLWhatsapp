export interface MarketplaceAccount {
  id: string;
  user_id: string;
  company_id: string;
  user_type: string;
  access_token: string;
  refresh_token?: string;
  updated_at: string;
  created_at: string;
}

export interface Subaccount {
  id: string;
  user_id: string;
  location_id: string;
  name?: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  subaccount_id: string;
  phone_number?: string;
  status: 'initializing' | 'qr' | 'ready' | 'disconnected' | 'auth_failure';
  qr?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  user_id: string;
  subaccount_id: string;
  from_number: string;
  to_number: string;
  body?: string;
  media_url?: string;
  media_mime?: string;
  direction: 'in' | 'out';
  created_at: string;
}

export interface ProviderInstallation {
  id: string;
  user_id: string;
  subaccount_id: string;
  location_id: string;
  conversation_provider_id?: string;
  access_token?: string;
  refresh_token?: string;
  created_at: string;
}

export interface LocationSessionMap {
  id: string;
  user_id: string;
  subaccount_id: string;
  location_id: string;
  session_id: string;
  created_at: string;
}

export interface JWTPayload {
  sub: string; // user_id
  email?: string;
  iat: number;
  exp: number;
}

export interface OAuthState {
  return_url?: string;
  user_id?: string;
}

export interface MarketplaceTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface GHLMessagePayload {
  locationId: string;
  contactId?: string;
  phone?: string;
  message?: string;
  attachments?: Array<{
    url: string;
    type: string;
    name?: string;
  }>;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body?: string;
  hasMedia: boolean;
  mediaUrl?: string;
  mediaMime?: string;
  timestamp: number;
}
