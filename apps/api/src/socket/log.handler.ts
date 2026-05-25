import { Writable } from 'node:stream';
import type { Server as SocketIOServer } from 'socket.io';
import type { ServerStatsData } from '@deployquest/shared';

import { logger } from '../lib/logger.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { dockerService } from '../services/docker.service.js';
import { getPlayersOnline } from '../services/player.service.js';
import { redisConnection } from '../services/shutdown.job.js';

export function setupSocketHandlers(io: SocketIOServer) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !data.user) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.data = { userId: data.user.id };
      next();
    } catch {
      next(new Error('Authentication error: Internal error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id, userId: socket.data.userId }, 'Socket connected');

    socket.on('subscribe:logs', async (serverId: string) => {
      logger.info({ serverId, socketId: socket.id }, 'Client subscribed to logs');

      try {
        const { data: server, error } = await supabaseAdmin
          .from('servers')
          .select('container_id')
          .eq('id', serverId)
          .eq('user_id', socket.data.userId)
          .maybeSingle();

        if (error || !server) {
          socket.emit('server:logs', `[System] Server not found or access denied.`);
          return;
        }

        if (!server.container_id) {
          socket.emit('server:logs', `[System] Server is not running.`);
          return;
        }

        const logStream = await dockerService.getContainerLogsStream(server.container_id, serverId);

        const emitLogs = new Writable({
          write(chunk, encoding, callback) {
            const lines = chunk.toString('utf-8').trimEnd().split('\n');
            for (const line of lines) {
              socket.emit('server:logs', line);
            }
            callback();
          },
        });

        dockerService.demuxStream(logStream, emitLogs, emitLogs);

        const cleanup = () => {
          if ('destroy' in logStream && typeof logStream.destroy === 'function') {
            logStream.destroy();
          }
        };

        socket.on('disconnect', cleanup);
        socket.on('unsubscribe:logs', cleanup);
      } catch (error) {
        const err = error as Error;
        logger.error({ err, serverId }, 'Failed to subscribe to logs');
        socket.emit('server:logs', `[System] Failed to stream logs: ${err.message}`);
      }
    });

    socket.on('subscribe:stats', async (serverId: string) => {
      logger.info({ serverId, socketId: socket.id }, 'Client subscribed to stats');

      try {
        const { data: server, error } = await supabaseAdmin
          .from('servers')
          .select('container_id')
          .eq('id', serverId)
          .eq('user_id', socket.data.userId)
          .maybeSingle();

        if (error || !server || !server.container_id) {
          return;
        }

        const statsStream = await dockerService.getContainerStatsStream(
          server.container_id,
          serverId,
        );

        let buffer = '';

        const onData = (chunk: Buffer) => {
          buffer += chunk.toString('utf-8');
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const raw = JSON.parse(line);

              // Safe CPU calculation (robust against missing/undefined values in Windows WSL2)
              const cpuUsage = raw.cpu_stats?.cpu_usage?.total_usage ?? 0;
              const preCpuUsage = raw.precpu_stats?.cpu_usage?.total_usage ?? 0;
              const systemUsage = raw.cpu_stats?.system_cpu_usage ?? 0;
              const preSystemUsage = raw.precpu_stats?.system_cpu_usage ?? 0;

              const cpuDelta = cpuUsage - preCpuUsage;
              const systemDelta = systemUsage - preSystemUsage;
              const numCpus = raw.cpu_stats?.online_cpus ?? 1;

              let cpuPercent = 0;
              if (systemDelta > 0 && cpuDelta > 0) {
                cpuPercent = Math.round((cpuDelta / systemDelta) * numCpus * 1000) / 10;
              }

              // Safe Memory calculation (robust against undefined/missing nested fields)
              const memUsage = raw.memory_stats?.usage ?? 0;
              const memLimit = raw.memory_stats?.limit ?? 1;
              const memoryUsageMB = Math.round((memUsage / (1024 * 1024)) * 10) / 10;
              const memoryLimitMB = Math.round((memLimit / (1024 * 1024)) * 10) / 10;
              const memoryPercent = memLimit > 0 ? Math.round((memUsage / memLimit) * 1000) / 10 : 0;

              const stats: ServerStatsData = {
                cpuPercent,
                memoryUsageMB,
                memoryLimitMB,
                memoryPercent,
              };

              socket.emit('server:stats', stats);
            } catch (err) {
              logger.error({ err, line }, 'Failed to parse or calculate container stats');
            }
          }
        };

        statsStream.on('data', onData);

        const cleanupStats = () => {
          statsStream.removeListener('data', onData);
          if ('destroy' in statsStream && typeof statsStream.destroy === 'function') {
            statsStream.destroy();
          }
        };

        socket.on('disconnect', cleanupStats);
        socket.on('unsubscribe:stats', cleanupStats);
      } catch (error) {
        const err = error as Error;
        logger.error({ err, serverId }, 'Failed to subscribe to stats');
      }
    });

    socket.on('subscribe:players', async (serverId: string) => {
      logger.info({ serverId, socketId: socket.id }, 'Client subscribed to players');

      let isActive = true;

      const checkPlayers = async () => {
        if (!isActive) return;

        try {
          const { data: server, error } = await supabaseAdmin
            .from('servers')
            .select('*')
            .eq('id', serverId)
            .eq('user_id', socket.data.userId)
            .maybeSingle();

          if (error || !server || !server.container_id) {
            return;
          }

          if (server.status !== 'running' && server.status !== 'ready') {
            return; // Only check if running
          }

          const playersOnline = await getPlayersOnline(server);
          
          let idleTimeRemaining: number | null = null;
          const strikeKey = `idle_strike:${serverId}`;

          if (playersOnline > 0) {
            // Player is online! Reset the strike instantly.
            await redisConnection.del(strikeKey);
            idleTimeRemaining = null;
          } else if (playersOnline === 0) {
            // No players online, check if it's already idle
            const strikesStr = await redisConnection.get(strikeKey);
            if (strikesStr !== null) {
              const strikes = parseInt(strikesStr, 10);
              idleTimeRemaining = Math.max(0, (2 - strikes) * 5);
            }
          }

          socket.emit('server:players', { playersOnline, idleTimeRemaining });
        } catch (err) {
          logger.error({ err, serverId }, 'Failed to check players for socket client');
        }
      };

      // Run immediately, then every 10 seconds
      checkPlayers();
      const interval = setInterval(checkPlayers, 10000);

      const cleanupPlayers = () => {
        isActive = false;
        clearInterval(interval);
      };

      socket.on('disconnect', cleanupPlayers);
      socket.on('unsubscribe:players', cleanupPlayers);
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket disconnected');
    });
  });
}
