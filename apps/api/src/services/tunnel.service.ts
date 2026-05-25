import { Writable } from 'node:stream';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { dockerService } from './docker.service.js';

export class TunnelService {
  async startPlayitTunnel(serverId: string, userId: string, secretKey: string, game: 'minecraft' | 'terraria' = 'minecraft') {
    logger.info({ serverId, game }, 'Starting Playit tunnel container');
    await dockerService.startPlayitContainer(serverId, userId, secretKey, game);
  }
}

export const tunnelService = new TunnelService();
