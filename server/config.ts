/**
 * Shared SafeCycle server configuration.
 */

export const VALID_PHASES = new Set([
  'menstrual',
  'follicular',
  'ovulatory',
  'luteal',
]);

export const VALID_LANGS = new Set([
  'en', 'fr', 'es', 'de', 'ja', 'pt', 'it',
]);

export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const ALLOWED_ORIGINS = new Set([
  'https://inferencevision.store',
  'http://localhost:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
]);

export const ALLOWED_CORS_METHODS = 'GET, POST, OPTIONS';
export const ALLOWED_CORS_HEADERS = 'Content-Type';

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
