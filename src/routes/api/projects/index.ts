import type { RequestHandler } from '@builder.io/qwik-city';
import { ObjectId } from 'mongodb';
import { getDb } from '~/lib/mongodb';
import { requireAuth } from '~/lib/auth';
import { rateLimit, setCorsHeaders, validateBody, sanitize } from '~/lib/api-protection';

// GET: Fetch all projects (public)
export const onGet: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  if (!rateLimit(requestEvent)) {
    requestEvent.json(429, { error: 'Too many requests' });
    return;
  }

  try {
    const db = await getDb();
    const projects = await db.collection('projects')
      .find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    requestEvent.json(200, { success: true, data: projects });
  } catch (error) {
    console.error('Get projects error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};

// POST: Create a new project (protected)
export const onPost: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  const user = requireAuth(requestEvent);
  if (!user) {
    requestEvent.json(401, { error: 'Unauthorized' });
    return;
  }

  if (!rateLimit(requestEvent)) {
    requestEvent.json(429, { error: 'Too many requests' });
    return;
  }

  try {
    const body = await requestEvent.request.json();
    
    const validationError = validateBody(body, ['title_en', 'title_ar', 'description_en', 'description_ar']);
    if (validationError) {
      requestEvent.json(400, { error: validationError });
      return;
    }

    const db = await getDb();
    const project = {
      title_en: sanitize(body.title_en),
      title_ar: sanitize(body.title_ar),
      description_en: sanitize(body.description_en),
      description_ar: sanitize(body.description_ar),
      technologies: body.technologies || [],
      image: body.image || '',
      url: body.url || '',
      github: body.github || '',
      published: body.published ?? true,
      order: body.order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('projects').insertOne(project);
    requestEvent.json(201, { success: true, data: { ...project, _id: result.insertedId } });
  } catch (error) {
    console.error('Create project error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};

// PUT: Update a project (protected)
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
      requestEvent.json(400, { error: 'Project ID is required' });
      return;
    }

    const db = await getDb();
    const updateData: any = { updatedAt: new Date() };
    
    if (body.title_en) updateData.title_en = sanitize(body.title_en);
    if (body.title_ar) updateData.title_ar = sanitize(body.title_ar);
    if (body.description_en) updateData.description_en = sanitize(body.description_en);
    if (body.description_ar) updateData.description_ar = sanitize(body.description_ar);
    if (body.technologies) updateData.technologies = body.technologies;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.github !== undefined) updateData.github = body.github;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.order !== undefined) updateData.order = body.order;

    await db.collection('projects').updateOne(
      { _id: new ObjectId(body._id) },
      { $set: updateData }
    );

    requestEvent.json(200, { success: true, message: 'Project updated' });
  } catch (error) {
    console.error('Update project error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};

// DELETE: Delete a project (protected)
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
      requestEvent.json(400, { error: 'Project ID is required' });
      return;
    }

    const db = await getDb();
    await db.collection('projects').deleteOne({ _id: new ObjectId(body._id) });

    requestEvent.json(200, { success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    requestEvent.json(500, { error: 'Internal server error' });
  }
};
