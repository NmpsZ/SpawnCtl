import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { dockerService } from './docker.service.js';
import { getPlayersOnline } from './player.service.js';

export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const shutdownQueue = new Queue('auto-shutdown', { connection: redisConnection });

export async function setupShutdownJob() {
  // Clear any existing repeatable jobs to avoid duplicates during dev restarts
  const repeatableJobs = await shutdownQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await shutdownQueue.removeRepeatableByKey(job.key);
  }

  // Add the job to run every 5 minutes
  await shutdownQueue.add(
    'check-idle-servers',
    {},
    {
      repeat: {
        pattern: '*/5 * * * *',
      },
    },
  );

  logger.info('Auto-shutdown cron job scheduled (every 5 mins).');
}

export const shutdownWorker = new Worker(
  'auto-shutdown',
  async (job) => {
    if (job.name === 'check-idle-servers') {
      logger.info('Running idle server check...');
      await checkIdleServers();
    }
  },
  { connection: redisConnection },
);

shutdownWorker.on('completed', (job) => {
  logger.debug({ jobId: job.id }, 'Shutdown job completed');
});

shutdownWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Shutdown job failed');
});

async function checkIdleServers() {
  const { data: runningServers, error } = await supabaseAdmin
    .from('servers')
    .select('*')
    .in('status', ['running', 'ready']);

  if (error || !runningServers) {
    logger.error({ error }, 'Failed to fetch running servers for shutdown check');
    return;
  }

  for (const server of runningServers) {
    if (!server.container_id || (server.game !== 'minecraft' && server.game !== 'terraria')) {
      continue;
    }

    try {
      const playersOnline = await getPlayersOnline(server);
      
      if (playersOnline === -1) {
        continue;
      }

      const strikeKey = `idle_strike:${server.id}`;

      if (playersOnline === 0) {
        const strikes = await redisConnection.incr(strikeKey);
        // Expiration just in case it doesn't get cleaned up
        await redisConnection.expire(strikeKey, 86400);

        logger.info({ serverId: server.id, strikes, game: server.game }, 'Server is empty.');

        if (strikes >= 2) {
          logger.info({ serverId: server.id }, 'Server empty for 2 checks (10 mins). Shutting down...');
          await dockerService.stopManagedContainer(server.container_id, server.id);
          
          await supabaseAdmin
            .from('servers')
            .update({ status: 'offline' })
            .eq('id', server.id);
            
          await redisConnection.del(strikeKey);
        }
      } else {
        // Someone is online, reset strikes
        logger.debug({ serverId: server.id, playersOnline }, 'Players are online. Resetting strike.');
        await redisConnection.del(strikeKey);
      }
    } catch (err) {
      logger.error({ err, serverId: server.id }, 'Error during idle check for server');
    }
  }
}
