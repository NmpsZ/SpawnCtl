import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { dockerService } from '../services/docker.service.js';

export const systemHealthRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', requireAuth);

  app.get('/', async (req: FastifyRequest) => {
    const userId = req.authUser.id;

    const [systemInfo, containers, serversResult] = await Promise.all([
      dockerService.getSystemInfo(),
      dockerService.getActiveContainerRegistry(),
      supabaseAdmin
        .from('servers')
        .select('id, status')
        .eq('user_id', userId),
    ]);

    // Map server IDs to their DB status
    const serverStatuses = new Map<string, string>(
      (serversResult.data ?? []).map((s: { id: string; status: string }) => [s.id, s.status])
    );

    // Filter: user's game containers that still have a matching DB record
    const userContainers = containers
      .filter(
        (c) =>
          c.userId === userId &&
          !c.name.startsWith('playit-') &&
          serverStatuses.has(c.serverId),
      )
      .map((c) => ({
        ...c,
        dbStatus: serverStatuses.get(c.serverId),
      }));

    return {
      system: {
        dockerVersion: systemInfo.dockerVersion,
        cpus: systemInfo.cpus,
        totalMemoryBytes: systemInfo.totalMemoryBytes,
        maxAllocatedMemoryMb: env.MAX_ALLOCATED_MEMORY_MB,
        operatingSystem: systemInfo.operatingSystem,
        storageDriver: systemInfo.storageDriver,
      },
      containers: userContainers,
      summary: {
        running: userContainers.filter((c) => c.state === 'running').length,
        stopped: userContainers.filter((c) => c.state !== 'running').length,
        total: userContainers.length,
      },
    };
  });
};
