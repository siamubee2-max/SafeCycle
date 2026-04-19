/**
 * Rate limiter with optional file-based persistence.
 * Survives server restarts and auto-cleans stale entries.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store file in project root (same dir as .env)
const STORE_PATH = process.env.RATE_LIMIT_STORE
  ? path.resolve(process.env.RATE_LIMIT_STORE)
  : path.resolve(__dirname, 'rate-limit-store.json');

export interface RateEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

const LIMIT = 20;       // max requests
const WINDOW = 60_000;  // per 60 seconds

let cache: Map<string, RateEntry> = loadStore();

function loadStore(): Map<string, RateEntry> {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const data: Record<string, RateEntry> = JSON.parse(raw);
      return new Map(Object.entries(data));
    }
  } catch {
    // Corrupt file — fresh start
  }
  return new Map();
}

function saveStore(): void {
  try {
    fs.writeFileSync(
      STORE_PATH,
      JSON.stringify(Object.fromEntries(cache)),
      'utf-8'
    );
  } catch {
    // Ignore write errors — non-critical
  }
}

// Cleanup stale entries every 5 minutes
let cleanupTimer: NodeJS.Timer | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    let changed = false;
    for (const [ip, entry] of cache) {
      if (now > entry.resetAt) {
        cache.delete(ip);
        changed = true;
      }
    }
    if (changed) saveStore();
  }, 5 * 60 * 1000);
  cleanupTimer.unref(); // Don't block process exit
}

export function isRateLimited(
  ip: string,
  opts?: RateLimitOptions
): boolean {
  startCleanup();

  const limit = opts?.maxRequests ?? LIMIT;
  const window = opts?.windowMs ?? WINDOW;
  const now = Date.now();

  const entry = cache.get(ip);
  if (!entry || now > entry.resetAt) {
    cache.set(ip, { count: 1, resetAt: now + window });
    return false;
  }
  if (entry.count >= limit) return true;
  entry.count++;

  // Persist every 5th hit to avoid excessive writes
  if (entry.count % 5 === 0) saveStore();

  return false;
}

export function getActiveEntries(): number {
  const now = Date.now();
  let count = 0;
  for (const entry of cache.values()) {
    if (now <= entry.resetAt) count++;
  }
  return count;
}
