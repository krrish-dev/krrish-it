import type { RequestHandler } from '@builder.io/qwik-city';
import { ObjectId } from 'mongodb';
import { getDb } from '~/lib/mongodb';
import { requireAuth } from '~/lib/auth';
import { rateLimit, setCorsHeaders, validateBody, sanitize } from '~/lib/api-protection';

// GET: Fetch all published blog posts (public)
export const onGet: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  if (!rateLimit(requestEvent)) {
    requestEvent.json(429, { error: 'Too many requests' });
    return;
  }

  try {
    const db = await getDb();
    const posts = await db.collection('blog_posts')
      .find({ published: true })
      .sort({ createdAt: -1 })
      .toArray();

    requestEvent.json(200, { success: true, data: posts });
  } catch (error) {
    console.error('Get blog posts error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};

// POST: Create a new blog post (protected)
export const onPost: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  const user = requireAuth(requestEvent);
  if (!user) {
    requestEvent.json(401, { error: 'Unauthorized' });
    return;
  }

  try {
    const body = await requestEvent.request.json();
    
    const validationError = validateBody(body, ['title_en', 'title_ar', 'content_en', 'content_ar']);
    if (validationError) {
      requestEvent.json(400, { error: validationError });
      return;
    }

    const db = await getDb();
    const post = {
      title_en: sanitize(body.title_en),
      title_ar: sanitize(body.title_ar),
      content_en: body.content_en, // Allow HTML for blog content
      content_ar: body.content_ar,
      excerpt_en: sanitize(body.excerpt_en || ''),
      excerpt_ar: sanitize(body.excerpt_ar || ''),
      slug: body.slug || body.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tags: body.tags || [],
      image: body.image || '',
      published: body.published ?? false,
      author: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('blog_posts').insertOne(post);
    requestEvent.json(201, { success: true, data: { ...post, _id: result.insertedId } });
  } catch (error) {
    console.error('Create blog post error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};

// PUT: Update a blog post (protected)
export const onPut: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  const user = requireAuth(requestEvent);
  if (!user) {
    requestEvent.json(401, { error: 'Unauthorized' });
    return;
  }

  try {
    const body = await requestEvent.request.json();
    if (!body._id) {
      requestEvent.json(400, { error: 'Post ID is required' });
      return;
    }

    const db = await getDb();
    const updateData: any = { updatedAt: new Date() };
    
    if (body.title_en) updateData.title_en = sanitize(body.title_en);
    if (body.title_ar) updateData.title_ar = sanitize(body.title_ar);
    if (body.content_en) updateData.content_en = body.content_en;
    if (body.content_ar) updateData.content_ar = body.content_ar;
    if (body.excerpt_en) updateData.excerpt_en = sanitize(body.excerpt_en);
    if (body.excerpt_ar) updateData.excerpt_ar = sanitize(body.excerpt_ar);
    if (body.slug) updateData.slug = body.slug;
    if (body.tags) updateData.tags = body.tags;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.published !== undefined) updateData.published = body.published;

    await db.collection('blog_posts').updateOne(
      { _id: new ObjectId(body._id) },
      { $set: updateData }
    );

    requestEvent.json(200, { success: true, message: 'Post updated' });
  } catch (error) {
    console.error('Update blog post error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};

// DELETE: Delete a blog post (protected)
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
      requestEvent.json(400, { error: 'Post ID is required' });
      return;
    }

    const db = await getDb();
    await db.collection('blog_posts').deleteOne({ _id: new ObjectId(body._id) });

    requestEvent.json(200, { success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};
