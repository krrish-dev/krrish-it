import { MongoClient, ObjectId } from 'mongodb';
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

const DB_NAME = 'krrish_db';
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;

let clientPromise: Promise<MongoClient> | null = null;
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

export const config = {
  path: '/api/*',
};
