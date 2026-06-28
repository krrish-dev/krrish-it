import type { RequestHandler } from '@builder.io/qwik-city';
import { setCorsHeaders } from '~/lib/api-protection';

export const onPost: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  requestEvent.cookie.delete('auth_token', { path: '/' });
  requestEvent.json(200, { success: true, message: 'Logged out successfully' });
};
