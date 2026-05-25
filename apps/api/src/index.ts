import { Server as SocketIOServer } from 'socket.io';

import { env } from './config/env.js';
import { createApp } from './app.js';
import { logger } from './lib/logger.js';
import { setupSocketHandlers } from './socket/log.handler.js';

try {
  const app = await createApp();

  const io = new SocketIOServer(app.server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  setupSocketHandlers(io);

  await app.listen({
    host: '0.0.0.0',
    port: env.API_PORT,
  });
} catch (error) {
  logger.error({ error }, 'Failed to start SpawnCtl API');
  process.exit(1);
}
