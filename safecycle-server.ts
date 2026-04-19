/**
 * SafeCycle API Proxy Server
 * Serves the SafeCycle PWA as a static SPA at /safecycle/*
 * and proxies Gemini AI requests server-side.
 *
 * Port: 3002
 * Managed by PM2 (safecycle-api)
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { corsMiddleware } from './server/middleware.js';
import { handlePrompt, handleInsight } from './server/gemini-handlers.js';
import { GEMINI_API_KEY } from './server/config.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(corsMiddleware);

// ─── Gemini Proxy (shared handlers) ─────────────────────────────────────────
app.post('/api/gemini/prompt', handlePrompt(GEMINI_API_KEY));
app.post('/api/gemini/insight', handleInsight(GEMINI_API_KEY));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'safecycle-api' }));

// ─── Static SPA (the built PWA) ───────────────────────────────────────────────
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, 'public');

if (fs.existsSync(STATIC_DIR)) {
  app.use('/safecycle', express.static(STATIC_DIR, { maxAge: '7d' }));

  // SPA fallback — serve index.html for all /safecycle routes
  app.use('/safecycle/*', (_req, res) => {
    res.sendFile(path.join(STATIC_DIR, 'index.html'));
  });
} else {
  console.warn(`[SafeCycle] Static dir not found: ${STATIC_DIR}`);
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[SafeCycle] Server running on port ${PORT}`);
  console.log(`[SafeCycle] Static dir: ${STATIC_DIR}`);
  console.log(
    `[SafeCycle] Gemini key: ${GEMINI_API_KEY ? 'configured' : 'MISSING'}`
  );
});
