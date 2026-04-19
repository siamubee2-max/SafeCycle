/**
 * SafeCycle — AES-256-GCM Encryption Utility
 * Uses the Web Crypto API for true local encryption.
 * A device-specific key is generated once and stored as a JWK in localStorage.
 * While the key is on-device, this protects data exports and cross-site access.
 */

const KEY_STORAGE_ID = 'sc_device_key_v1';
const ALGO = { name: 'AES-GCM', length: 256 };

// Prefix to reliably identify encrypted blobs (avoids base64 false positives)
const ENC_PREFIX = 'sc1:';

async function getOrCreateKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(KEY_STORAGE_ID);
  if (stored) {
    try {
      const jwk = JSON.parse(stored);
      return await crypto.subtle.importKey('jwk', jwk, ALGO, true, ['encrypt', 'decrypt']);
    } catch {
      // Corrupted key — generate a new one
    }
  }
  const key = await crypto.subtle.generateKey(ALGO, true, ['encrypt', 'decrypt']);
  const jwk = await crypto.subtle.exportKey('jwk', key);
  localStorage.setItem(KEY_STORAGE_ID, JSON.stringify(jwk));
  return key;
}

/**
 * Safe base64 encoding that works on large buffers without stack overflow.
 * The spread operator (...new Uint8Array(buffer)) can blow the call stack
 * when data is large. This iterates instead.
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function encryptData(plaintext: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  // Format: ENC_PREFIX + base64(iv) + ":" + base64(ciphertext)
  return `${ENC_PREFIX}${bufferToBase64(iv.buffer)}:${bufferToBase64(ciphertext)}`;
}

export async function decryptData(encrypted: string): Promise<string> {
  const withoutPrefix = encrypted.startsWith(ENC_PREFIX)
    ? encrypted.slice(ENC_PREFIX.length)
    : encrypted;
  const colonIdx = withoutPrefix.indexOf(':');
  if (colonIdx === -1) throw new Error('Invalid encrypted format');
  const ivB64 = withoutPrefix.slice(0, colonIdx);
  const ctB64 = withoutPrefix.slice(colonIdx + 1);
  const key = await getOrCreateKey();
  const iv = base64ToBuffer(ivB64);
  const ciphertext = base64ToBuffer(ctB64);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}

/** Encrypted localStorage wrapper */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await encryptData(value);
    localStorage.setItem(key, encrypted);
  },

  async getItem(key: string): Promise<string | null> {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    // Check for our versioned encryption prefix (reliable detection)
    if (stored.startsWith(ENC_PREFIX)) {
      try {
        return await decryptData(stored);
      } catch {
        return null; // Corrupted — discard rather than returning garbage
      }
    }
    // Legacy unencrypted data — return as-is; will be re-encrypted on next write
    return stored;
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    // Only clear app data keys, not the device key
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k !== KEY_STORAGE_ID) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  },

  clearAppData(): void {
    // Explicitly clear journal + AI cache data but keep device key
    const appKeys = ['journal_entries'];
    ['en', 'fr', 'es', 'de', 'ja', 'pt', 'it'].forEach(lang => {
      appKeys.push(`daily_ai_prompt_${lang}`, `daily_ai_insight_${lang}`);
    });
    appKeys.forEach(k => localStorage.removeItem(k));
  }
};
