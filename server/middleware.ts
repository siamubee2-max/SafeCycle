/**
 * Shared CORS middleware — allows production domain, local dev, and null origin (native WebView).
 */

import { Request, Response, NextFunction } from 'express';
import { ALLOWED_ORIGINS, ALLOWED_CORS_METHODS, ALLOWED_CORS_HEADERS } from './config.js';

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const origin = req.headers.origin || '';

  // Allow null/empty origin for native WebViews (Android/iOS)
  if (origin === 'null' || origin === '') {
    // Pass through without setting CORS header
  } else if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', ALLOWED_CORS_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_CORS_HEADERS);

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
}
