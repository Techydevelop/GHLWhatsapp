export interface Database {
  public: {
    Tables: {
      marketplace_accounts: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          user_type: string;
          access_token: string;
          refresh_token: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          user_type: string;
          access_token: string;
          refresh_token?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          user_type?: string;
          access_token?: string;
          refresh_token?: string | null;
          updated_at?: string;
          created_at?: string;
        };
      };
      subaccounts: {
        Row: {
          id: string;
          user_id: string;
          location_id: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location_id: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location_id?: string;
          name?: string | null;
          created_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          subaccount_id: string;
          phone_number: string | null;
          status: string;
          qr: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subaccount_id: string;
          phone_number?: string | null;
          status?: string;
          qr?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subaccount_id?: string;
          phone_number?: string | null;
          status?: string;
          qr?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          subaccount_id: string;
          from_number: string;
          to_number: string;
          body: string | null;
          media_url: string | null;
          media_mime: string | null;
          direction: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          subaccount_id: string;
          from_number: string;
          to_number: string;
          body?: string | null;
          media_url?: string | null;
          media_mime?: string | null;
          direction: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          subaccount_id?: string;
          from_number?: string;
          to_number?: string;
          body?: string | null;
          media_url?: string | null;
          media_mime?: string | null;
          direction?: string;
          created_at?: string;
        };
      };
      provider_installations: {
        Row: {
          id: string;
          user_id: string;
          subaccount_id: string;
          location_id: string;
          conversation_provider_id: string | null;
          access_token: string | null;
          refresh_token: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subaccount_id: string;
          location_id: string;
          conversation_provider_id?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subaccount_id?: string;
          location_id?: string;
          conversation_provider_id?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          created_at?: string;
        };
      };
      location_session_map: {
        Row: {
          id: string;
          user_id: string;
          subaccount_id: string;
          location_id: string;
          session_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subaccount_id: string;
          location_id: string;
          session_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subaccount_id?: string;
          location_id?: string;
          session_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
