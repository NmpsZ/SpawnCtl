import net from 'node:net';
import { supabaseAdmin } from '../lib/supabase.js';
import { dockerService } from './docker.service.js';
import { logger } from '../lib/logger.js';

/**
 * Helper function to check if a TCP port is open and accepting connections
 */
function checkTcpPort(port: number, host = '127.0.0.1', timeout = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

export function startReadyCheckScheduler() {
  logger.info('Initializing background Game Server Ready-Check scheduler (every 10 seconds)...');

  setInterval(async () => {
    try {
      // Find all servers that are currently in 'running' (Booting/Loading) status
      const { data: servers, error } = await supabaseAdmin
        .from('servers')
        .select('*')
        .eq('status', 'running');

      if (error) {
        logger.error({ error }, 'Failed to fetch running servers for ready-check');
        return;
      }

      if (!servers || servers.length === 0) {
        return;
      }

      for (const server of servers) {
        if (!server.container_id) continue;

        let isReady = false;

        if (server.game === 'minecraft') {
          // Minecraft uses 25565/tcp
          const runtime = await dockerService.inspectManagedContainer(server.container_id, server.id, '25565/tcp');
          if (runtime.hostPort) {
            // Check if the Minecraft game port is open
            isReady = await checkTcpPort(runtime.hostPort);
          }
        } else if (server.game === 'terraria') {
          // Terraria uses 7777/tcp
          const runtime = await dockerService.inspectManagedContainer(server.container_id, server.id, '7777/tcp');
          if (runtime.hostPort) {
            // Check if the Terraria game port is open
            isReady = await checkTcpPort(runtime.hostPort);
          }
        }

        if (isReady) {
          logger.info(
            { serverId: server.id, game: server.game },
            'Game server is fully loaded and ready to accept connections!',
          );

          // Update server status to 'ready'
          const { error: updateError } = await supabaseAdmin
            .from('servers')
            .update({ status: 'ready' })
            .eq('id', server.id);

          if (updateError) {
            logger.error({ serverId: server.id, updateError }, 'Failed to update server status to ready');
          }
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error in ready check scheduler loop');
    }
  }, 10000); // Check every 10 seconds
}
