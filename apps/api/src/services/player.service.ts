import * as util from 'minecraft-server-util';
import { logger } from '../lib/logger.js';
import { dockerService } from './docker.service.js';

export async function getPlayersOnline(server: any): Promise<number> {
  if (!server.container_id) {
    return -1;
  }

  try {
    if (server.game === 'minecraft') {
      const runtime = await dockerService.inspectManagedContainer(server.container_id, server.id, '25565/tcp');
      if (!runtime.hostPort) {
        return -1;
      }
      
      const status = await util.status('127.0.0.1', runtime.hostPort, { timeout: 3000 });
      return status.players.online;
    } else if (server.game === 'terraria') {
      const runtime = await dockerService.inspectManagedContainer(server.container_id, server.id, '7878/tcp');
      if (!runtime.hostPort) {
        return -1;
      }
      
      await dockerService.sendCommand(server.container_id, server.id, 'playing');
      
      // Wait 1 second for the server to process and print to stdout
      await new Promise(r => setTimeout(r, 1000));
      
      const container = dockerService['docker'].getContainer(server.container_id);
      const logs = await container.logs({ tail: 20, stdout: true, stderr: true });
      const logText = logs.toString('utf8');
      
      // Parse from the bottom up to get the most recent command output
      const matches = [...logText.matchAll(/(No players connected\.)|(?:(\d+) players? connected\.)/g)];
      
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        if (lastMatch?.[1]) {
          return 0;
        } else if (lastMatch?.[2]) {
          return parseInt(lastMatch[2], 10);
        }
      }
      
      logger.warn({ serverId: server.id }, 'Could not parse players online from Terraria logs');
      return -1;
    }
  } catch (err) {
    logger.warn({ serverId: server.id, err }, `Failed to query players online for ${server.game}`);
    return -1;
  }

  return -1;
}
