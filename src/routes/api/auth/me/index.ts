import type { RequestHandler } from '@builder.io/qwik-city';
import { requireAuth } from '~/lib/auth';
import { setCorsHeaders } from '~/lib/api-protection';

export const onGet: RequestHandler = async (requestEvent) => {
  setCorsHeaders(requestEvent);

  const user = requireAuth(requestEvent);
  if (!user) {
    requestEvent.json(401, { error: 'Not authenticated' });
    return;
  }

  requestEvent.json(200, {
    success: true,
    user: {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
  });
};
