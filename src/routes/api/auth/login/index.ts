import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '~/lib/mongodb';
import { verifyPassword, generateToken } from '~/lib/auth';
import { rateLimit, setCorsHeaders, validateBody } from '~/lib/api-protection';

export const onPost: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  // Rate limiting
  if (!rateLimit(requestEvent)) {
    requestEvent.json(429, { error: 'Too many requests. Please try again later.' });
    return;
  }

  try {
    const body = await requestEvent.request.json();
    
    // Validate required fields
    const validationError = validateBody(body, ['email', 'password']);
    if (validationError) {
      requestEvent.json(400, { error: validationError });
      return;
    }

    const { email, password } = body;

    const db = await getDb();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      requestEvent.json(401, { error: 'Invalid email or password' });
      return;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      requestEvent.json(401, { error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'admin',
    });

    // Set HTTP-only cookie
    requestEvent.cookie.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    requestEvent.json(200, {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};

export const onOptions: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);
  requestEvent.send(204, '');
};
