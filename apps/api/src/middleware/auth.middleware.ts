import type { FastifyRequest } from 'fastify';

import { HttpError } from '../lib/http-error.js';
import { supabaseAdmin } from '../lib/supabase.js';

export async function requireAuth(req: FastifyRequest) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null;

  if (!token) {
    throw new HttpError(401, 'missing_token', 'Missing bearer token.');
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    throw new HttpError(401, 'invalid_token', 'Invalid or expired bearer token.');
  }

  req.authUser = {
    email: data.user.email ?? null,
    id: data.user.id,
  };
}
