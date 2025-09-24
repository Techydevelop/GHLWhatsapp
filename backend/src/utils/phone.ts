import { parsePhoneNumber, isValidPhoneNumber, PhoneNumber } from 'libphonenumber-js';

/**
 * Normalize a raw phone number to E164 format
 * @param raw - Raw phone number string
 * @returns E164 formatted phone number (e.g., "+923001234567")
 */
export function normalizeToE164(raw: string): string {
  if (!raw) {
    throw new Error('Phone number is required');
  }

  // Clean the input - remove all non-digit characters except +
  const cleaned = raw.replace(/[^\d+]/g, '');
  
  try {
    // Try to parse as international number first
    if (cleaned.startsWith('+')) {
      const phoneNumber = parsePhoneNumber(cleaned);
      if (phoneNumber && isValidPhoneNumber(phoneNumber.number)) {
        return phoneNumber.format('E.164');
      }
    }
    
    // Try parsing with different country codes
    const commonCountryCodes = ['US', 'PK', 'IN', 'GB', 'CA', 'AU'];
    
    for (const countryCode of commonCountryCodes) {
      try {
        const phoneNumber = parsePhoneNumber(cleaned, countryCode as any);
        if (phoneNumber && isValidPhoneNumber(phoneNumber.number)) {
          return phoneNumber.format('E.164');
        }
      } catch {
        // Continue to next country code
      }
    }
    
    // If all else fails, try to parse without country code (assume US)
    const phoneNumber = parsePhoneNumber(cleaned, 'US');
    if (phoneNumber && isValidPhoneNumber(phoneNumber.number)) {
      return phoneNumber.format('E.164');
    }
    
    throw new Error('Invalid phone number format');
  } catch (error) {
    throw new Error(`Failed to normalize phone number: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert E164 phone number to WhatsApp JID format
 * @param e164 - E164 formatted phone number (e.g., "+923001234567")
 * @returns WhatsApp JID format (e.g., "923001234567@c.us")
 */
export function toWAJid(e164: string): string {
  if (!e164) {
    throw new Error('E164 phone number is required');
  }
  
  // Remove the + sign and add @c.us suffix
  const number = e164.replace('+', '');
  return `${number}@c.us`;
}

/**
 * Convert WhatsApp JID to E164 format
 * @param jid - WhatsApp JID (e.g., "923001234567@c.us")
 * @returns E164 formatted phone number (e.g., "+923001234567")
 */
export function fromWAJid(jid: string): string {
  if (!jid) {
    throw new Error('WhatsApp JID is required');
  }
  
  // Extract number from JID and add + prefix
  const number = jid.split('@')[0];
  return `+${number}`;
}

/**
 * Validate if a phone number is in valid E164 format
 * @param e164 - Phone number to validate
 * @returns boolean indicating if the number is valid E164
 */
export function isValidE164(e164: string): boolean {
  try {
    const phoneNumber = parsePhoneNumber(e164);
    return phoneNumber && isValidPhoneNumber(phoneNumber.number);
  } catch {
    return false;
  }
}

/**
 * Format phone number for display
 * @param e164 - E164 formatted phone number
 * @returns Formatted phone number for display
 */
export function formatForDisplay(e164: string): string {
  try {
    const phoneNumber = parsePhoneNumber(e164);
    if (phoneNumber && isValidPhoneNumber(phoneNumber.number)) {
      return phoneNumber.formatInternational();
    }
    return e164;
  } catch {
    return e164;
  }
}
