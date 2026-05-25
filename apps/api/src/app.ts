import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { healthRoutes } from './routes/health.js';
import { serversRoutes } from './routes/servers.js';
import { profileRoutes } from './routes/profile.js';
import { systemHealthRoutes } from './routes/system-health.js';

import { setupShutdownJob } from './services/shutdown.job.js';
import { startReadyCheckScheduler } from './services/ready-check.service.js';

export async function createApp() {
  const app = Fastify({
    bodyLimit: 64 * 1024,
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        env.NODE_ENV === 'production'
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
              },
            },
    },
  });

  app.setErrorHandler(errorHandler);

  await app.register(cors, {
    credentials: true,
    origin: env.CORS_ORIGIN,
  });
  await app.register(rateLimit, {
    global: false,
  });

  await app.register(healthRoutes, {
    prefix: '/health',
  });
  await app.register(serversRoutes, {
    prefix: '/api/v1/servers',
  });
  await app.register(profileRoutes, {
    prefix: '/api/v1/profile',
  });
  await app.register(systemHealthRoutes, {
    prefix: '/api/v1/system-health',
  });

  // Initialize background jobs
  try {
    await setupShutdownJob();
  } catch (err) {
    app.log.error({ err }, 'Failed to initialize shutdown job (is Redis running?)');
  }

  try {
    startReadyCheckScheduler();
  } catch (err) {
    app.log.error({ err }, 'Failed to initialize ready check scheduler');
  }

  return app;
}
