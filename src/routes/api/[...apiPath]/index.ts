import type { RequestHandler } from '@builder.io/qwik-city';
import apiHandler from '~/lib/server/api-handler';

export const onRequest: RequestHandler = async ({ request, headers, json, text }) => {
  const response = await apiHandler(request);
  const body = await response.text();
  const contentType = response.headers.get('content-type') || '';

  response.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey === 'set-cookie') {
      headers.append('Set-Cookie', value);
      return;
    }

    if (normalizedKey !== 'content-length') {
      headers.set(key, value);
    }
  });

  if (response.status === 204) {
    text(204, '');
    return;
  }

  if (contentType.includes('application/json')) {
    json(response.status, body ? JSON.parse(body) : null);
    return;
  }

  text(response.status, body);
};
