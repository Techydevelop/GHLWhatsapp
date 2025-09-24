import { Message } from 'whatsapp-web.js';
import { supabaseAdmin } from '../config/database';
import { normalizeToE164, toWAJid, fromWAJid } from '../utils/phone';
import axios from 'axios';

export class WhatsAppManager {
  private static activeClients = new Map<string, any>();

  /**
   * Handle inbound WhatsApp messages
   */
  static async handleInboundMessage(
    message: Message,
    sessionId: string,
    userId: string,
    subaccountId: string
  ): Promise<void> {
    try {
      // Skip messages from status broadcasts
      if (message.from.includes('status@broadcast')) {
        return;
      }

      const fromNumber = fromWAJid(message.from);
      const toNumber = fromWAJid(message.to);
      
      let body = message.body;
      let mediaUrl: string | undefined;
      let mediaMime: string | undefined;

      // Handle media messages
      if (message.hasMedia) {
        try {
          const media = await message.downloadMedia();
          if (media) {
            mediaUrl = media.data;
            mediaMime = media.mimetype;
            body = message.body || `[${media.mimetype}]`;
          }
        } catch (error) {
          console.error('Error downloading media:', error);
          body = message.body || '[Media message - download failed]';
        }
      }

      // Save message to database
      const { data: savedMessage, error } = await supabaseAdmin
        .from('messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          subaccount_id: subaccountId,
          from_number: fromNumber,
          to_number: toNumber,
          body,
          media_url: mediaUrl,
          media_mime: mediaMime,
          direction: 'in'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving inbound message:', error);
        return;
      }

      console.log(`Saved inbound message ${savedMessage.id} from ${fromNumber}`);

      // Forward to GHL if provider installation exists
      await this.forwardToGHL(savedMessage, sessionId, userId, subaccountId);

    } catch (error) {
      console.error('Error handling inbound message:', error);
    }
  }

  /**
   * Send outbound message via WhatsApp
   */
  static async sendMessage(
    client: any,
    to: string,
    body?: string,
    mediaUrl?: string,
    mediaMime?: string
  ): Promise<any> {
    try {
      const normalizedTo = normalizeToE164(to);
      const waJid = toWAJid(normalizedTo);

      let message;

      if (mediaUrl && mediaMime) {
        // Send media message
        const media = {
          data: mediaUrl,
          mimetype: mediaMime
        };
        message = await client.sendMessage(waJid, media);
      } else if (body) {
        // Send text message
        message = await client.sendMessage(waJid, body);
      } else {
        throw new Error('Either body or media must be provided');
      }

      return message;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Forward inbound message to GHL Conversations
   */
  private static async forwardToGHL(
    message: any,
    sessionId: string,
    userId: string,
    subaccountId: string
  ): Promise<void> {
    try {
      // Get provider installation for this subaccount
      const { data: providerInstallation, error: providerError } = await supabaseAdmin
        .from('provider_installations')
        .select('*')
        .eq('subaccount_id', subaccountId)
        .eq('user_id', userId)
        .single();

      if (providerError || !providerInstallation) {
        console.log('No provider installation found, skipping GHL forward');
        return;
      }

      if (!providerInstallation.conversation_provider_id || !providerInstallation.access_token) {
        console.log('Provider installation missing required fields, skipping GHL forward');
        return;
      }

      // Get location ID
      const { data: subaccount, error: subaccountError } = await supabaseAdmin
        .from('subaccounts')
        .select('location_id')
        .eq('id', subaccountId)
        .single();

      if (subaccountError || !subaccount) {
        console.error('Error getting subaccount location:', subaccountError);
        return;
      }

      // Prepare GHL message payload
      const ghlPayload = {
        locationId: subaccount.location_id,
        contactId: null, // We don't have GHL contact ID
        phone: message.from_number,
        message: message.body,
        attachments: message.media_url ? [{
          url: message.media_url,
          type: message.media_mime || 'image',
          name: `whatsapp_media_${message.id}`
        }] : undefined
      };

      // Call GHL inbound message API
      const response = await axios.post(
        `https://services.leadconnectorhq.com/conversations/messages`,
        ghlPayload,
        {
          headers: {
            'Authorization': `Bearer ${providerInstallation.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`Forwarded message ${message.id} to GHL:`, response.status);

    } catch (error) {
      console.error('Error forwarding message to GHL:', error);
    }
  }

  /**
   * Get WhatsApp client for a session
   */
  static getClient(sessionId: string): any {
    return this.activeClients.get(sessionId);
  }

  /**
   * Store WhatsApp client reference
   */
  static setClient(sessionId: string, client: any): void {
    this.activeClients.set(sessionId, client);
  }

  /**
   * Remove WhatsApp client reference
   */
  static removeClient(sessionId: string): void {
    this.activeClients.delete(sessionId);
  }

  /**
   * Get all active clients
   */
  static getActiveClients(): Map<string, any> {
    return this.activeClients;
  }
}
