import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

export const profileRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', requireAuth);

  fastify.get('/', getProfile);

  fastify.put<{
    Body: {
      playit_secret?: string;
      playit_static_ip?: string;
      playit_minecraft_static_ip?: string;
      playit_terraria_static_ip?: string;
    };
  }>(
    '/',
    {
      preHandler: validateBody(
        z.object({
          playit_secret: z.string().trim().min(1).or(z.literal('')).optional(),
          playit_static_ip: z.string().trim().min(1).or(z.literal('')).optional(),
          playit_minecraft_static_ip: z.string().trim().min(1).or(z.literal('')).optional(),
          playit_terraria_static_ip: z.string().trim().min(1).or(z.literal('')).optional(),
        }),
      ),
    },
    updateProfile,
  );
};
