import type { RequestHandler } from '@builder.io/qwik-city';
import { ObjectId } from 'mongodb';
import { getDb } from '~/lib/mongodb';
import { requireAuth } from '~/lib/auth';
import { rateLimit, setCorsHeaders, validateBody, sanitize } from '~/lib/api-protection';

// GET: Fetch all messages (protected - admin only)
export const onGet: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  const user = requireAuth(requestEvent);
  if (!user) {
    requestEvent.json(401, { error: 'Unauthorized' });
    return;
  }

  try {
    const db = await getDb();
    const messages = await db.collection('messages')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    requestEvent.json(200, { success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};

// POST: Send a new message (public - contact form)
export const onPost: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  if (!rateLimit(requestEvent)) {
    requestEvent.json(429, { error: 'Too many requests. Please try again later.' });
    return;
  }

  try {
    const body = await requestEvent.request.json();
    
    const validationError = validateBody(body, ['name', 'email', 'message']);
    if (validationError) {
      requestEvent.json(400, { error: validationError });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      requestEvent.json(400, { error: 'Invalid email format' });
      return;
    }

    const db = await getDb();
    const message = {
      name: sanitize(body.name),
      email: sanitize(body.email),
      subject: sanitize(body.subject || ''),
      message: sanitize(body.message),
      read: false,
      createdAt: new Date(),
    };

    await db.collection('messages').insertOne(message);
    requestEvent.json(201, { success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};

// DELETE: Delete a message (protected)
export const onDelete: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  const user = requireAuth(requestEvent);
  if (!user) {
    requestEvent.json(401, { error: 'Unauthorized' });
    return;
  }

  try {
    const body = await requestEvent.request.json();
    if (!body._id) {
      requestEvent.json(400, { error: 'Message ID is required' });
      return;
    }

    const db = await getDb();
    await db.collection('messages').deleteOne({ _id: new ObjectId(body._id) });

    requestEvent.json(200, { success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};
