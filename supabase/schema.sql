-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create marketplace_accounts table
CREATE TABLE marketplace_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    company_id TEXT NOT NULL,
    user_type TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subaccounts table
CREATE TABLE subaccounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    location_id TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    subaccount_id UUID NOT NULL,
    phone_number TEXT,
    status TEXT NOT NULL DEFAULT 'initializing',
    qr TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    subaccount_id UUID NOT NULL,
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    body TEXT,
    media_url TEXT,
    media_mime TEXT,
    direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider_installations table
CREATE TABLE provider_installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    subaccount_id UUID NOT NULL,
    location_id TEXT NOT NULL,
    conversation_provider_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create location_session_map table
CREATE TABLE location_session_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    subaccount_id UUID NOT NULL,
    location_id TEXT UNIQUE NOT NULL,
    session_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_marketplace_accounts_user_id ON marketplace_accounts(user_id);
CREATE INDEX idx_subaccounts_user_id ON subaccounts(user_id);
CREATE INDEX idx_subaccounts_location_id ON subaccounts(location_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_subaccount_id ON sessions(subaccount_id);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_subaccount_id ON messages(subaccount_id);
CREATE INDEX idx_provider_installations_user_id ON provider_installations(user_id);
CREATE INDEX idx_provider_installations_location_id ON provider_installations(location_id);
CREATE INDEX idx_location_session_map_user_id ON location_session_map(user_id);
CREATE INDEX idx_location_session_map_location_id ON location_session_map(location_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE marketplace_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subaccounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_session_map ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_accounts
CREATE POLICY "Users can view own marketplace accounts" ON marketplace_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketplace accounts" ON marketplace_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketplace accounts" ON marketplace_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketplace accounts" ON marketplace_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for subaccounts
CREATE POLICY "Users can view own subaccounts" ON subaccounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subaccounts" ON subaccounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subaccounts" ON subaccounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subaccounts" ON subaccounts
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sessions
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for provider_installations
CREATE POLICY "Users can view own provider installations" ON provider_installations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own provider installations" ON provider_installations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own provider installations" ON provider_installations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own provider installations" ON provider_installations
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for location_session_map
CREATE POLICY "Users can view own location session maps" ON location_session_map
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location session maps" ON location_session_map
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own location session maps" ON location_session_map
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own location session maps" ON location_session_map
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_marketplace_accounts_updated_at BEFORE UPDATE ON marketplace_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
