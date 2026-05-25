import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import {
  createServer,
  deleteServer,
  getServerStatus,
  startMinecraftServer,
  startTerrariaServer,
  stopServer,
  sendCommand,
} from '../controllers/server.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { startServerRateLimit } from '../middleware/rateLimit.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';

const emptyBodySchema = z.object({}).strict();
const serverIdParamsSchema = z.object({
  id: z.string().uuid(),
});
const createServerBodySchema = z.object({
  name: z.string().min(1).max(50),
  game: z.enum(['minecraft', 'terraria']),
  version: z.string().min(1).max(30),
  memory: z.enum(['1G', '2G']),
  gameMode: z.enum(['survival', 'creative', 'adventure', 'spectator']),
  difficulty: z.enum(['peaceful', 'easy', 'normal', 'hard']),
  seed: z.string().max(100).optional(),
});

const commandBodySchema = z.object({
  command: z.string().min(1),
});

export const serversRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', {
    config: {
      rateLimit: startServerRateLimit,
    },
    preHandler: [requireAuth, validateBody(createServerBodySchema)],
    handler: createServer,
  });

  app.post('/minecraft/start', {
    config: {
      rateLimit: startServerRateLimit,
    },
    preHandler: [requireAuth, validateBody(emptyBodySchema)],
    handler: startMinecraftServer,
  });

  app.post('/terraria/start', {
    config: {
      rateLimit: startServerRateLimit,
    },
    preHandler: [requireAuth, validateBody(emptyBodySchema)],
    handler: startTerrariaServer,
  });

  app.post('/:id/stop', {
    preHandler: [requireAuth, validateParams(serverIdParamsSchema), validateBody(emptyBodySchema)],
    handler: stopServer,
  });

  app.get('/:id/status', {
    preHandler: [requireAuth, validateParams(serverIdParamsSchema)],
    handler: getServerStatus,
  });

  app.post('/:id/command', {
    preHandler: [requireAuth, validateParams(serverIdParamsSchema), validateBody(commandBodySchema)],
    handler: sendCommand,
  });

  app.delete('/:id', {
    preHandler: [requireAuth, validateParams(serverIdParamsSchema)],
    handler: deleteServer,
  });
};
