import { MongoClient, ObjectId, type Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

type JsonBody = Record<string, unknown>;
type GoogleIndexingNotificationType = 'URL_UPDATED' | 'URL_DELETED';
type GoogleIndexingAction = 'list' | 'publish' | 'metadata';

const DB_NAME = 'krrish_db';
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const GOOGLE_INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_INDEXING_PUBLISH_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const GOOGLE_INDEXING_METADATA_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications/metadata';

let clientPromise: Promise<MongoClient> | null = null;
let googleIndexingIndexesReady = false;
let googleAccessTokenCache: { token: string; expiresAt: number } | null = null;
const rateLimitMap = new Map<string, RateLimitRecord>();

function env(key: string): string {
  return ((globalThis as any).Netlify?.env?.get?.(key) || process.env[key] || '').trim();
}

function headers(req: Request, extra: HeadersInit = {}): HeadersInit {
  const base: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };

  const origin = req.headers.get('origin');
  const allowedOrigin = env('ALLOWED_ORIGIN');

  if (origin && (allowedOrigin === '*' || allowedOrigin === origin)) {
    base['Access-Control-Allow-Origin'] = origin;
    base['Access-Control-Allow-Credentials'] = 'true';
    base.Vary = 'Origin';
  }

  return { ...base, ...extra };
}

function json(req: Request, status: number, body: JsonBody, extra: HeadersInit = {}): Response {
  return Response.json(body, { status, headers: headers(req, extra) });
}

function options(req: Request): Response {
  return new Response(null, {
    status: 204,
    headers: headers(req, {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }),
  });
}

function clientIp(req: Request): string {
  return (
    req.headers.get('x-nf-client-connection-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimit(req: Request): boolean {
  const ip = clientIp(req);
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count += 1;
  return true;
}

function sanitize(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function validate(body: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    const value = body[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `Field "${field}" is required`;
    }
  }
  return null;
}

async function readBody(req: Request): Promise<Record<string, any>> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

async function db() {
  const uri = env('MONGODB_URI');
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }

  return (await clientPromise).db(DB_NAME);
}

function jwtSecret(): string {
  const secret = env('JWT_SECRET');
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

function cookies(req: Request): Record<string, string> {
  return (req.headers.get('cookie') || '').split(';').reduce<Record<string, string>>((out, part) => {
    const index = part.indexOf('=');
    if (index === -1) return out;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
    return out;
  }, {});
}

function auth(req: Request): JwtPayload | null {
  const cookieToken = cookies(req).auth_token;
  const authHeader = req.headers.get('authorization');
  const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '');

  if (!token) return null;

  try {
    return jwt.verify(token, jwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && ObjectId.isValid(value);
}

function normalizeGooglePrivateKey(rawValue: string): string {
  let key = rawValue.trim();

  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  return key.replace(/\\n/g, '\n');
}

function googleIndexingEnabled(): boolean {
  return env('GOOGLE_INDEXING_ENABLED').toLowerCase() !== 'false';
}

function googleIndexingAllowedHosts(): string[] {
  return (env('GOOGLE_INDEXING_ALLOWED_HOSTS') || 'krrish.it,www.krrish.it')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function validateIndexingUrl(rawUrl: unknown): string {
  const value = String(rawUrl || '').trim();
  if (!value) throw createHttpError('URL is required', 400);

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw createHttpError('Invalid URL format', 400);
  }

  if (!['https:', 'http:'].includes(parsed.protocol)) {
    throw createHttpError('Only HTTP and HTTPS URLs are allowed', 400);
  }

  const allowedHosts = googleIndexingAllowedHosts();
  if (!allowedHosts.includes(parsed.hostname.toLowerCase())) {
    throw createHttpError(`URL host is not allowed. Allowed hosts: ${allowedHosts.join(', ')}`, 400);
  }

  parsed.hash = '';
  return parsed.toString();
}

function validateIndexingType(rawType: unknown): GoogleIndexingNotificationType {
  const type = String(rawType || env('GOOGLE_INDEXING_DEFAULT_TYPE') || 'URL_UPDATED').toUpperCase();
  if (type !== 'URL_UPDATED' && type !== 'URL_DELETED') {
    throw createHttpError('Invalid notification type. Use URL_UPDATED or URL_DELETED.', 400);
  }
  return type;
}

function getIndexingUrlProperties(url: string, type?: GoogleIndexingNotificationType) {
  const parsed = new URL(url);
  return {
    url,
    type: type || null,
    protocol: parsed.protocol.replace(':', ''),
    host: parsed.hostname,
    pathname: parsed.pathname,
    search: parsed.search || '',
    allowedHost: googleIndexingAllowedHosts().includes(parsed.hostname.toLowerCase()),
    fragmentRemoved: true,
    googleIndexed: null,
    indexingProof: 'notification_only',
    note:
      'Google Indexing API confirms notification delivery/metadata only. It does not prove that the URL is indexed in Google Search.',
  };
}

function createHttpError(message: string, status = 500, details: unknown = null): Error & { status?: number; details?: unknown } {
  const error = new Error(message) as Error & { status?: number; details?: unknown };
  error.status = status;
  error.details = details;
  return error;
}

function extractGoogleNotifyTime(payload: Record<string, any>): string | null {
  return (
    payload?.urlNotificationMetadata?.latestUpdate?.notifyTime ||
    payload?.urlNotificationMetadata?.latestRemove?.notifyTime ||
    null
  );
}

function getGoogleIndexingDailyLimit(): number {
  const value = Number(env('GOOGLE_INDEXING_DAILY_LIMIT') || 50);
  return Number.isFinite(value) && value > 0 ? value : 50;
}

function getGoogleIndexingDuplicateCooldownMinutes(): number {
  const value = Number(env('GOOGLE_INDEXING_DUPLICATE_COOLDOWN_MINUTES') || 15);
  return Number.isFinite(value) && value >= 0 ? value : 15;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function ensureGoogleIndexingIndexes(database: Db): Promise<void> {
  if (googleIndexingIndexesReady) return;

  await Promise.all([
    database.collection('google_indexing_logs').createIndex({ createdAt: -1 }),
    database.collection('google_indexing_logs').createIndex({ url: 1, type: 1, createdAt: -1 }),
    database.collection('google_indexing_logs').createIndex({ status: 1, createdAt: -1 }),
  ]);

  googleIndexingIndexesReady = true;
}

async function getGoogleAccessToken(): Promise<string> {
  if (googleAccessTokenCache && googleAccessTokenCache.expiresAt > Date.now() + 60_000) {
    return googleAccessTokenCache.token;
  }

  if (!googleIndexingEnabled()) {
    throw createHttpError('Google Indexing integration is disabled', 503);
  }

  const clientEmail = env('GOOGLE_INDEXING_CLIENT_EMAIL');
  const privateKey = normalizeGooglePrivateKey(env('GOOGLE_INDEXING_PRIVATE_KEY'));

  if (!clientEmail || !privateKey) {
    throw createHttpError('Google Indexing credentials are missing from environment variables', 500);
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: clientEmail,
      scope: GOOGLE_INDEXING_SCOPE,
      aud: GOOGLE_TOKEN_ENDPOINT,
      iat: now,
      exp: now + 3600,
    },
    privateKey,
    { algorithm: 'RS256' },
  );

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, any>;

  if (!response.ok || !data.access_token) {
    throw createHttpError(data.error_description || data.error || 'Google OAuth token request failed', response.status || 502, data);
  }

  const expiresIn = Number(data.expires_in || 3600);
  googleAccessTokenCache = {
    token: String(data.access_token),
    expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1000,
  };

  return googleAccessTokenCache.token;
}

async function publishGoogleIndexingNotification(url: string, type: GoogleIndexingNotificationType): Promise<Record<string, any>> {
  const accessToken = await getGoogleAccessToken();
  const response = await fetch(GOOGLE_INDEXING_PUBLISH_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type }),
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, any>;

  if (!response.ok) {
    throw createHttpError(data?.error?.message || 'Google Indexing publish request failed', response.status || 502, data);
  }

  return data;
}

async function getGoogleIndexingMetadata(url: string): Promise<Record<string, any>> {
  const accessToken = await getGoogleAccessToken();
  const endpoint = `${GOOGLE_INDEXING_METADATA_ENDPOINT}?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, any>;

  if (!response.ok) {
    throw createHttpError(data?.error?.message || 'Google Indexing metadata request failed', response.status || 502, data);
  }

  return data;
}

async function googleIndexing(req: Request, action: GoogleIndexingAction): Promise<Response> {
  const user = auth(req);
  if (!user) return json(req, 401, { error: 'Unauthorized' });

  const method = req.method.toUpperCase();
  const database = await db();
  await ensureGoogleIndexingIndexes(database);

  const logs = database.collection('google_indexing_logs');
  const dailyLimit = getGoogleIndexingDailyLimit();
  const sentToday = await logs.countDocuments({ status: 'sent', createdAt: { $gte: startOfToday() } });

  if (action === 'list' && method === 'GET') {
    const data = await logs.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    return json(req, 200, {
      success: true,
      data,
      info: {
        enabled: googleIndexingEnabled(),
        allowedHosts: googleIndexingAllowedHosts(),
        dailyLimit,
        sentToday,
        remainingToday: Math.max(dailyLimit - sentToday, 0),
        duplicateCooldownMinutes: getGoogleIndexingDuplicateCooldownMinutes(),
      },
    });
  }

  if (action === 'metadata' && method === 'POST') {
    const body = await readBody(req);
    const url = validateIndexingUrl(body.url);

    try {
      const metadata = await getGoogleIndexingMetadata(url);
      return json(req, 200, {
        success: true,
        data: {
          url,
          properties: getIndexingUrlProperties(url),
          googleMetadata: metadata,
          googleNotifyTime: extractGoogleNotifyTime(metadata),
          googleIndexed: null,
          indexingProof: 'notification_only',
        },
      });
    } catch (error) {
      const err = error as Error & { status?: number; details?: unknown };
      return json(req, err.status || 502, {
        success: false,
        error: err.message,
        details: err.details || null,
        data: {
          url,
          properties: getIndexingUrlProperties(url),
          googleIndexed: null,
          indexingProof: 'notification_only',
        },
      });
    }
  }

  if (action === 'publish' && method === 'POST') {
    const body = await readBody(req);
    const url = validateIndexingUrl(body.url);
    const type = validateIndexingType(body.type);
    const force = Boolean(body.force);
    const properties = getIndexingUrlProperties(url, type);

    if (sentToday >= dailyLimit && !force) {
      return json(req, 429, {
        success: false,
        error: `Daily Google Indexing limit reached (${dailyLimit})`,
        data: { url, type, properties, sentToday, dailyLimit },
      });
    }

    const cooldownMinutes = getGoogleIndexingDuplicateCooldownMinutes();
    const duplicateCutoff = new Date(Date.now() - cooldownMinutes * 60 * 1000);

    if (!force && cooldownMinutes > 0) {
      const duplicate = await logs.findOne({
        url,
        type,
        status: 'sent',
        createdAt: { $gte: duplicateCutoff },
      });

      if (duplicate) {
        const skippedLog = {
          url,
          type,
          status: 'skipped',
          reason: `Duplicate request inside ${cooldownMinutes} minute cooldown`,
          createdBy: user.email,
          createdAt: new Date(),
          properties,
        };
        const insert = await logs.insertOne(skippedLog);
        return json(req, 200, {
          success: true,
          skipped: true,
          message: skippedLog.reason,
          data: { ...skippedLog, _id: insert.insertedId, duplicateOf: duplicate._id },
        });
      }
    }

    try {
      const googleResponse = await publishGoogleIndexingNotification(url, type);
      const log = {
        url,
        type,
        status: 'sent',
        googleNotifyTime: extractGoogleNotifyTime(googleResponse),
        googleResponse,
        properties,
        createdBy: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insert = await logs.insertOne(log);

      return json(req, 200, {
        success: true,
        message: 'Sent to Google successfully',
        data: {
          ...log,
          _id: insert.insertedId,
          googleIndexed: null,
          indexingProof: 'notification_only',
        },
      });
    } catch (error) {
      const err = error as Error & { status?: number; details?: unknown };
      const log = {
        url,
        type,
        status: 'failed',
        errorMessage: err.message,
        googleStatus: err.status || 500,
        googleResponse: err.details || null,
        properties,
        createdBy: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insert = await logs.insertOne(log);

      return json(req, err.status || 502, {
        success: false,
        error: err.message,
        data: { ...log, _id: insert.insertedId },
      });
    }
  }

  return json(req, 405, { error: 'Method not allowed' });
}

async function setup(req: Request): Promise<Response> {
  const database = await db();
  const existingUser = await database.collection('users').findOne({});

  if (existingUser) {
    return json(req, 403, { error: 'Setup already completed. Admin user exists.' });
  }

  const body = await readBody(req);
  const error = validate(body, ['email', 'password', 'name']);
  if (error) return json(req, 400, { error });

  await database.collection('users').insertOne({
    email: String(body.email).toLowerCase(),
    password: await bcrypt.hash(String(body.password), 12),
    name: sanitize(body.name),
    role: 'admin',
    createdAt: new Date(),
  });

  await Promise.all([
    database.collection('users').createIndex({ email: 1 }, { unique: true }),
    database.collection('projects').createIndex({ published: 1, order: 1 }),
    database.collection('blog_posts').createIndex({ published: 1, slug: 1 }),
    database.collection('messages').createIndex({ createdAt: -1 }),
    database.collection('google_indexing_logs').createIndex({ createdAt: -1 }),
  ]);

  return json(req, 201, { success: true, message: 'Admin user created successfully. You can now login.' });
}

async function login(req: Request): Promise<Response> {
  if (!rateLimit(req)) {
    return json(req, 429, { error: 'Too many requests. Please try again later.' });
  }

  const body = await readBody(req);
  const error = validate(body, ['email', 'password']);
  if (error) return json(req, 400, { error });

  const user = await (await db()).collection('users').findOne({ email: String(body.email).toLowerCase() });

  if (!user || !(await bcrypt.compare(String(body.password), String(user.password)))) {
    return json(req, 401, { error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'admin',
    },
    jwtSecret(),
    { expiresIn: '7d' },
  );

  return json(
    req,
    200,
    {
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
    {
      'Set-Cookie': `auth_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${TOKEN_MAX_AGE_SECONDS}`,
    },
  );
}

function logout(req: Request): Response {
  return json(
    req,
    200,
    { success: true, message: 'Logged out successfully' },
    { 'Set-Cookie': 'auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0' },
  );
}

function me(req: Request): Response {
  const user = auth(req);
  if (!user) return json(req, 401, { error: 'Not authenticated' });

  return json(req, 200, {
    success: true,
    user: {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
  });
}

async function projects(req: Request): Promise<Response> {
  const method = req.method.toUpperCase();
  const database = await db();

  if (method === 'GET') {
    if (!rateLimit(req)) return json(req, 429, { error: 'Too many requests' });

    const query = auth(req) ? {} : { published: true };
    const data = await database.collection('projects').find(query).sort({ order: 1, createdAt: -1 }).toArray();
    return json(req, 200, { success: true, data });
  }

  if (!auth(req)) return json(req, 401, { error: 'Unauthorized' });

  if (method === 'POST') {
    const body = await readBody(req);
    const error = validate(body, ['title_en', 'title_ar', 'description_en', 'description_ar']);
    if (error) return json(req, 400, { error });

    const project = {
      title_en: sanitize(body.title_en),
      title_ar: sanitize(body.title_ar),
      description_en: sanitize(body.description_en),
      description_ar: sanitize(body.description_ar),
      technologies: Array.isArray(body.technologies) ? body.technologies : [],
      image: sanitize(body.image || ''),
      url: sanitize(body.url || ''),
      github: sanitize(body.github || ''),
      published: body.published ?? true,
      order: Number(body.order || 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.collection('projects').insertOne(project);
    return json(req, 201, { success: true, data: { ...project, _id: result.insertedId } });
  }

  if (method === 'PUT') {
    const body = await readBody(req);
    if (!validId(body._id)) return json(req, 400, { error: 'Valid project ID is required' });

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title_en) updateData.title_en = sanitize(body.title_en);
    if (body.title_ar) updateData.title_ar = sanitize(body.title_ar);
    if (body.description_en) updateData.description_en = sanitize(body.description_en);
    if (body.description_ar) updateData.description_ar = sanitize(body.description_ar);
    if (Array.isArray(body.technologies)) updateData.technologies = body.technologies;
    if (body.image !== undefined) updateData.image = sanitize(body.image);
    if (body.url !== undefined) updateData.url = sanitize(body.url);
    if (body.github !== undefined) updateData.github = sanitize(body.github);
    if (body.published !== undefined) updateData.published = Boolean(body.published);
    if (body.order !== undefined) updateData.order = Number(body.order || 0);

    await database.collection('projects').updateOne({ _id: new ObjectId(body._id) }, { $set: updateData });
    return json(req, 200, { success: true, message: 'Project updated' });
  }

  if (method === 'DELETE') {
    const body = await readBody(req);
    if (!validId(body._id)) return json(req, 400, { error: 'Valid project ID is required' });

    await database.collection('projects').deleteOne({ _id: new ObjectId(body._id) });
    return json(req, 200, { success: true, message: 'Project deleted' });
  }

  return json(req, 405, { error: 'Method not allowed' });
}

async function blog(req: Request): Promise<Response> {
  const method = req.method.toUpperCase();
  const database = await db();

  if (method === 'GET') {
    if (!rateLimit(req)) return json(req, 429, { error: 'Too many requests' });

    const query = auth(req) ? {} : { published: true };
    const data = await database.collection('blog_posts').find(query).sort({ createdAt: -1 }).toArray();
    return json(req, 200, { success: true, data });
  }

  const user = auth(req);
  if (!user) return json(req, 401, { error: 'Unauthorized' });

  if (method === 'POST') {
    const body = await readBody(req);
    const error = validate(body, ['title_en', 'title_ar', 'content_en', 'content_ar']);
    if (error) return json(req, 400, { error });

    const post = {
      title_en: sanitize(body.title_en),
      title_ar: sanitize(body.title_ar),
      content_en: String(body.content_en || ''),
      content_ar: String(body.content_ar || ''),
      excerpt_en: sanitize(body.excerpt_en || ''),
      excerpt_ar: sanitize(body.excerpt_ar || ''),
      slug: sanitize(body.slug || String(body.title_en).toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      tags: Array.isArray(body.tags) ? body.tags : [],
      image: sanitize(body.image || ''),
      published: body.published ?? false,
      author: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.collection('blog_posts').insertOne(post);
    return json(req, 201, { success: true, data: { ...post, _id: result.insertedId } });
  }

  if (method === 'PUT') {
    const body = await readBody(req);
    if (!validId(body._id)) return json(req, 400, { error: 'Valid post ID is required' });

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title_en) updateData.title_en = sanitize(body.title_en);
    if (body.title_ar) updateData.title_ar = sanitize(body.title_ar);
    if (body.content_en) updateData.content_en = String(body.content_en);
    if (body.content_ar) updateData.content_ar = String(body.content_ar);
    if (body.excerpt_en) updateData.excerpt_en = sanitize(body.excerpt_en);
    if (body.excerpt_ar) updateData.excerpt_ar = sanitize(body.excerpt_ar);
    if (body.slug) updateData.slug = sanitize(body.slug);
    if (Array.isArray(body.tags)) updateData.tags = body.tags;
    if (body.image !== undefined) updateData.image = sanitize(body.image);
    if (body.published !== undefined) updateData.published = Boolean(body.published);

    await database.collection('blog_posts').updateOne({ _id: new ObjectId(body._id) }, { $set: updateData });
    return json(req, 200, { success: true, message: 'Post updated' });
  }

  if (method === 'DELETE') {
    const body = await readBody(req);
    if (!validId(body._id)) return json(req, 400, { error: 'Valid post ID is required' });

    await database.collection('blog_posts').deleteOne({ _id: new ObjectId(body._id) });
    return json(req, 200, { success: true, message: 'Post deleted' });
  }

  return json(req, 405, { error: 'Method not allowed' });
}

async function messages(req: Request): Promise<Response> {
  const method = req.method.toUpperCase();
  const database = await db();

  if (method === 'GET') {
    if (!auth(req)) return json(req, 401, { error: 'Unauthorized' });

    const data = await database.collection('messages').find({}).sort({ createdAt: -1 }).toArray();
    return json(req, 200, { success: true, data });
  }

  if (method === 'POST') {
    if (!rateLimit(req)) return json(req, 429, { error: 'Too many requests. Please try again later.' });

    const body = await readBody(req);
    const error = validate(body, ['name', 'email', 'message']);
    if (error) return json(req, 400, { error });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
      return json(req, 400, { error: 'Invalid email format' });
    }

    await database.collection('messages').insertOne({
      name: sanitize(body.name),
      email: sanitize(body.email),
      subject: sanitize(body.subject || ''),
      message: sanitize(body.message),
      read: false,
      createdAt: new Date(),
    });

    return json(req, 201, { success: true, message: 'Message sent successfully' });
  }

  if (method === 'DELETE') {
    if (!auth(req)) return json(req, 401, { error: 'Unauthorized' });

    const body = await readBody(req);
    if (!validId(body._id)) return json(req, 400, { error: 'Valid message ID is required' });

    await database.collection('messages').deleteOne({ _id: new ObjectId(body._id) });
    return json(req, 200, { success: true, message: 'Message deleted' });
  }

  return json(req, 405, { error: 'Method not allowed' });
}

async function route(req: Request): Promise<Response> {
  const path = new URL(req.url).pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') return options(req);
  if (path === '/api/auth/setup' && method === 'POST') return setup(req);
  if (path === '/api/auth/login' && method === 'POST') return login(req);
  if (path === '/api/auth/logout' && method === 'POST') return logout(req);
  if (path === '/api/auth/me' && method === 'GET') return me(req);
  if (path === '/api/projects') return projects(req);
  if (path === '/api/blog') return blog(req);
  if (path === '/api/messages') return messages(req);
  if (path === '/api/google-indexing') return googleIndexing(req, 'list');
  if (path === '/api/google-indexing/publish') return googleIndexing(req, 'publish');
  if (path === '/api/google-indexing/metadata') return googleIndexing(req, 'metadata');

  return json(req, 404, { error: 'API route not found' });
}

export default async function handler(req: Request): Promise<Response> {
  try {
    return await route(req);
  } catch (error) {
    console.error('API function error:', error);
    return json(req, 500, { error: 'Internal server error' });
  }
}
