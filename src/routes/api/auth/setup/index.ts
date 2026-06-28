import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '~/lib/mongodb';
import { hashPassword } from '~/lib/auth';
import { setCorsHeaders } from '~/lib/api-protection';

// POST: Create the first admin user (only works if no users exist)
export const onPost: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  try {
    const db = await getDb();
    
    // Check if any user already exists
    const existingUser = await db.collection('users').findOne({});
    if (existingUser) {
      requestEvent.json(403, { error: 'Setup already completed. Admin user exists.' });
      return;
    }

    const body = await requestEvent.request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      requestEvent.json(400, { error: 'Email, password, and name are required' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    await db.collection('users').insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'admin',
      createdAt: new Date(),
    });

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('projects').createIndex({ published: 1, order: 1 });
    await db.collection('blog_posts').createIndex({ published: 1, slug: 1 });
    await db.collection('messages').createIndex({ createdAt: -1 });

    requestEvent.json(201, { success: true, message: 'Admin user created successfully. You can now login.' });
  } catch (error) {
    console.error('Setup error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};
