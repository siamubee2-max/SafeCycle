/**
 * Shared Gemini proxy — request handling + rate limiting.
 * Both dev (server.ts) and prod (safecycle-server.ts) entry points use this.
 */

import { Request, Response } from 'express';
import { isRateLimited } from './rate-limiter.js';
import { VALID_PHASES, VALID_LANGS, GEMINI_API_URL } from './config.js';

const GEMINI_TIMEOUT = 8000;

async function callGemini(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT);

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.8,
      },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error: ${response.status} — ${err}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

interface PhaseLangBody {
  phase?: string;
  lang?: string;
}

interface InsightBody {
  phase?: string;
  lang?: string;
  entries?: Record<string, unknown>;
  dataSummary?: string;
}

export function handlePrompt(geminiApiKey: string) {
  return async (req: Request, res: Response): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    try {
      const { phase, lang } = req.body as PhaseLangBody;
      const phaseStr =
        typeof phase === 'string' && VALID_PHASES.has(phase) ? phase : 'follicular';
      const langStr =
        typeof lang === 'string' && VALID_LANGS.has(lang) ? lang : 'en';

      const prompt = `You are a compassionate women's health assistant. Generate a brief, warm daily reflection prompt (1-2 sentences) for someone in their ${phaseStr} menstrual phase. Language: ${langStr}. Be gentle, empowering, and body-positive. No medical advice.`;

      const text = await callGemini(prompt);
      res.json({ text, prompt: text });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[SafeCycle] /api/gemini/prompt error:', msg);
      res.status(500).json({ error: 'Failed to generate prompt' });
    }
  };
}

export function handleInsight(geminiApiKey: string) {
  return async (req: Request, res: Response): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    try {
      const { phase, lang, entries, dataSummary } = req.body as InsightBody;
      const phaseStr =
        typeof phase === 'string' && VALID_PHASES.has(phase) ? phase : 'follicular';
      const langStr =
        typeof lang === 'string' && VALID_LANGS.has(lang) ? lang : 'en';
      const entryCount =
        entries && typeof entries === 'object'
          ? Math.min(Object.keys(entries).length, 999)
          : 0;

      const prompt = `You are a knowledgeable, empathetic women's health coach. Based on ${entryCount} tracked days, the user is currently in their ${phaseStr} phase. Provide a concise, personalized health insight (2-3 sentences) focusing on energy, mood, and wellness. Language: ${langStr}. Be supportive, science-based, and avoid medical diagnoses.`;

      const text = await callGemini(prompt);
      res.json({ text, insight: text });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[SafeCycle] /api/gemini/insight error:', msg);
      res.status(500).json({ error: 'Failed to generate insight' });
    }
  };
}
