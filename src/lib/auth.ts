import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RequestEvent } from '@builder.io/qwik-city';

const JWT_SECRET = process.env.JWT_SECRET || 'krrish-it-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Extract token from request (cookie or header)
export function getTokenFromRequest(requestEvent: RequestEvent): string | null {
  // Check cookie first
  const cookieToken = requestEvent.cookie.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  // Check Authorization header
  const authHeader = requestEvent.request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

// Middleware: Protect API routes
export function requireAuth(requestEvent: RequestEvent): JWTPayload | null {
  const token = getTokenFromRequest(requestEvent);
  if (!token) return null;
  return verifyToken(token);
}
