/**
 * SafeCycle — Express Backend Proxy (development)
 * Minimal entry point — shared logic lives in `server/`.
 *
 * Proxied by Vite dev server at /api -> :3001.
 * Port: 3001
 */

import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './server/middleware.js';
import { handlePrompt, handleInsight } from './server/gemini-handlers.js';
import { GEMINI_API_KEY } from './server/config.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(corsMiddleware);

/** GET /health — quick liveness check */
app.get('/health', (_req, res) => res.json({ ok: true, service: 'safecycle-api-dev' }));

/** POST /api/gemini/prompt — AI journaling prompt */
app.post('/api/gemini/prompt', handlePrompt(GEMINI_API_KEY));

/** POST /api/gemini/insight — AI wellness insight */
app.post('/api/gemini/insight', handleInsight(GEMINI_API_KEY));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[SafeCycle Dev] API proxy running on port ${PORT}`);
  console.log(
    `[SafeCycle Dev] Gemini key: ${GEMINI_API_KEY ? 'configured' : 'MISSING - set GEMINI_API_KEY in .env'}`
  );
});
