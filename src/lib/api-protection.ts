import type { RequestEvent } from '@builder.io/qwik-city';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per window

export function rateLimit(requestEvent: RequestEvent): boolean {
  const ip = requestEvent.request.headers.get('x-forwarded-for') || 
             requestEvent.request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }

  record.count++;
  return true;
}

// CORS headers for API routes
export function setCorsHeaders(requestEvent: RequestEvent) {
  const headers = requestEvent.headers;
  headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
}

// Validate request body
export function validateBody(body: any, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      return `Field "${field}" is required`;
    }
  }
  return null;
}

// Sanitize input (basic XSS prevention)
export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
