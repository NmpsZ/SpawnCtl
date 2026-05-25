import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GameType, ServerRecord, ServerStatus } from '@deployquest/shared';

import { env } from '../config/env.js';
import { HttpError } from '../lib/http-error.js';
import { logger } from '../lib/logger.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { dockerService } from '../services/docker.service.js';
import { resourceService } from '../services/resource.service.js';
import { tunnelService } from '../services/tunnel.service.js';
import { redisConnection } from '../services/shutdown.job.js';

export async function sendCommand(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.authUser.id;
  const { id } = req.params as ServerIdParams;
  const { command } = req.body as { command: string };

  const server = await getOwnedServer(id, userId);

  if ((server.status !== 'running' && server.status !== 'ready') || !server.container_id) {
    throw new HttpError(400, 'server_not_running', 'Server is not running or has no container.');
  }

  await dockerService.sendCommand(server.container_id, server.id, command);

  reply.send({ success: true });
}

type ServerRow = {
  id: string;
  user_id: string;
  name: string;
  game: 'minecraft' | 'terraria';
  status: ServerStatus;
  version: string;
  memory: string;
  game_mode: string;
  difficulty: string;
  seed: string | null;
  container_id: string | null;
  tunnel_ip: string | null;
  tunnel_port: number | null;
  created_at: string;
  updated_at: string;
};

const activeStatuses: ServerStatus[] = ['starting', 'running', 'stopping'];

type ServerIdParams = {
  id: string;
};

function mapServer(row: ServerRow): ServerRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    game: row.game,
    status: row.status,
    version: row.version,
    memory: row.memory,
    gameMode: row.game_mode,
    difficulty: row.difficulty,
    seed: row.seed,
    containerId: row.container_id,
    tunnelIp: row.tunnel_ip,
    tunnelPort: row.tunnel_port,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


async function getOwnedServer(serverId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('servers')
    .select('*')
    .eq('id', serverId)
    .eq('user_id', userId)
    .maybeSingle<ServerRow>();

  if (error) {
    throw new HttpError(500, 'database_error', error.message);
  }

  if (!data) {
    throw new HttpError(404, 'server_not_found', 'Server was not found for this user.');
  }

  return data;
}

export async function createServer(req: FastifyRequest, reply: FastifyReply) {
  const { game } = req.body as { game: GameType };

  if (game === 'minecraft') {
    return startMinecraftServer(req, reply);
  }

  if (game === 'terraria') {
    return startTerrariaServer(req, reply);
  }

  throw new HttpError(400, 'unsupported_game', `Game type "${game}" is not yet supported.`);
}

export async function startTerrariaServer(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.authUser.id;

  // 1. Fetch user profile to get playit credentials
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('playit_secret, playit_static_ip, playit_terraria_static_ip')
    .eq('id', userId)
    .maybeSingle<{
      playit_secret: string | null;
      playit_static_ip: string | null;
      playit_terraria_static_ip: string | null;
    }>();

  if (profileError) {
    throw new HttpError(500, 'database_error', profileError.message);
  }

  const playitSecret = profile?.playit_secret;
  if (!playitSecret) {
    throw new HttpError(
      400,
      'playit_secret_required',
      'You must configure your Playit.gg Secret Key in the Settings page before starting a server.',
    );
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('servers')
    .select('id,status')
    .eq('user_id', userId)
    .in('status', activeStatuses)
    .limit(1)
    .maybeSingle<{ id: string; status: ServerStatus }>();

  if (existingError) {
    throw new HttpError(500, 'database_error', existingError.message);
  }

  if (existing) {
    throw new HttpError(
      409,
      'active_server_exists',
      'Only one active server is allowed per account in Phase 1.',
      existing,
    );
  }

  const body = req.body as Partial<ServerRecord>;
  
  let targetServerId: string;
  let serverConfig: ServerRow;

  const { data: offlineServer } = await supabaseAdmin
    .from('servers')
    .select('*')
    .eq('user_id', userId)
    .eq('game', 'terraria')
    .limit(1)
    .maybeSingle<ServerRow>();

  if (offlineServer) {
    targetServerId = offlineServer.id;
    const updateData = {
      status: 'starting' as ServerStatus,
      ...(body.name && { name: body.name }),
      ...(body.version && { version: body.version }),
      ...(body.memory && { memory: body.memory }),
      ...(body.gameMode && { game_mode: body.gameMode }),
      ...(body.difficulty && { difficulty: body.difficulty }),
      ...(body.seed !== undefined && { seed: body.seed }),
    };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('servers')
      .update(updateData)
      .eq('id', targetServerId)
      .select('*')
      .single<ServerRow>();

    if (updateError) {
      throw new HttpError(500, 'database_error', updateError.message);
    }
    serverConfig = updated;
  } else {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('servers')
      .insert({
        user_id: userId,
        game: 'terraria',
        status: 'starting',
        name: body.name || 'My Server',
        version: body.version || 'LATEST',
        memory: body.memory || '1G',
        game_mode: body.gameMode || 'survival',
        difficulty: body.difficulty || 'easy',
        seed: body.seed || null,
      })
      .select('*')
      .single<ServerRow>();

    if (insertError) {
      throw new HttpError(500, 'database_error', insertError.message);
    }
    targetServerId = inserted.id;
    serverConfig = inserted;
  }

  let startedContainerId: string | null = null;

  const canAllocate = await resourceService.canAllocateMemory();
  if (!canAllocate) {
    throw new HttpError(
      553,
      'insufficient_resources',
      'The host does not have enough memory available to start this server.',
    );
  }

  try {
    const runtime = await dockerService.startTerrariaServer({
      memory: serverConfig.memory || '1G',
      version: serverConfig.version,
      name: serverConfig.name,
      difficulty: serverConfig.difficulty,
      seed: serverConfig.seed,
      serverId: targetServerId,
      userId,
    });
    startedContainerId = runtime.containerId;

    let tunnelIp: string | null = null;
    let tunnelPort: number | null = null;

    const playitStaticIp = profile?.playit_terraria_static_ip;
    if (playitStaticIp) {
      const parts = playitStaticIp.split(':');
      tunnelIp = parts[0] ?? null;
      tunnelPort = parts[1] ? parseInt(parts[1], 10) : null;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('servers')
      .update({
        container_id: runtime.containerId,
        status: 'running',
        tunnel_ip: tunnelIp,
        tunnel_port: tunnelPort,
      })
      .eq('id', targetServerId)
      .eq('user_id', userId)
      .select('*')
      .single<ServerRow>();

    if (updateError) {
      throw new HttpError(500, 'database_error', updateError.message);
    }

    // Reset idle strike count in Redis when starting
    const strikeKey = `idle_strike:${targetServerId}`;
    await redisConnection.del(strikeKey).catch((err) => {
      logger.error({ err, serverId: targetServerId }, 'Failed to clear idle strike key on start');
    });

    // Start tunnel asynchronously so we don't block the API response
    tunnelService
      .startPlayitTunnel(targetServerId, userId, playitSecret, 'terraria')
      .catch((err) => {
        logger.error({ err, serverId: targetServerId }, 'Failed to start Playit tunnel');
      });

    reply.code(201).send({ server: mapServer(updated) });
  } catch (error) {
    logger.error({ error, serverId: targetServerId }, 'Failed to start Terraria container');

    if (startedContainerId) {
      await dockerService
        .stopManagedContainer(startedContainerId, targetServerId)
        .catch((stopError: unknown) => {
          logger.error(
            { error: stopError, serverId: targetServerId },
            'Failed to clean up started container',
          );
        });
    }

    await supabaseAdmin
      .from('servers')
      .update({
        status: 'offline',
      })
      .eq('id', targetServerId)
      .eq('user_id', userId);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, 'docker_start_failed', 'Failed to start Terraria server.');
  }
}

export async function startMinecraftServer(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.authUser.id;

  // 1. Fetch user profile to get playit credentials
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('playit_secret, playit_static_ip, playit_minecraft_static_ip')
    .eq('id', userId)
    .maybeSingle<{
      playit_secret: string | null;
      playit_static_ip: string | null;
      playit_minecraft_static_ip: string | null;
    }>();

  if (profileError) {
    throw new HttpError(500, 'database_error', profileError.message);
  }

  const playitSecret = profile?.playit_secret;
  if (!playitSecret) {
    throw new HttpError(
      400,
      'playit_secret_required',
      'You must configure your Playit.gg Secret Key in the Settings page before starting a server.',
    );
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('servers')
    .select('id,status')
    .eq('user_id', userId)
    .in('status', activeStatuses)
    .limit(1)
    .maybeSingle<{ id: string; status: ServerStatus }>();

  if (existingError) {
    throw new HttpError(500, 'database_error', existingError.message);
  }

  if (existing) {
    throw new HttpError(
      409,
      'active_server_exists',
      'Only one active server is allowed per account in Phase 1.',
      existing,
    );
  }

  const body = req.body as Partial<ServerRecord>;
  
  let targetServerId: string;
  let serverConfig: ServerRow;

  const { data: offlineServer } = await supabaseAdmin
    .from('servers')
    .select('*')
    .eq('user_id', userId)
    .eq('game', 'minecraft')
    .limit(1)
    .maybeSingle<ServerRow>();

  if (offlineServer) {
    targetServerId = offlineServer.id;
    const updateData = {
      status: 'starting' as ServerStatus,
      ...(body.name && { name: body.name }),
      ...(body.version && { version: body.version }),
      ...(body.memory && { memory: body.memory }),
      ...(body.gameMode && { game_mode: body.gameMode }),
      ...(body.difficulty && { difficulty: body.difficulty }),
      ...(body.seed !== undefined && { seed: body.seed }),
    };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('servers')
      .update(updateData)
      .eq('id', targetServerId)
      .select('*')
      .single<ServerRow>();

    if (updateError) {
      throw new HttpError(500, 'database_error', updateError.message);
    }
    serverConfig = updated;
  } else {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('servers')
      .insert({
        user_id: userId,
        game: 'minecraft',
        status: 'starting',
        name: body.name || 'My Server',
        version: body.version || 'LATEST',
        memory: body.memory || '1G',
        game_mode: body.gameMode || 'survival',
        difficulty: body.difficulty || 'easy',
        seed: body.seed || null,
      })
      .select('*')
      .single<ServerRow>();

    if (insertError) {
      throw new HttpError(500, 'database_error', insertError.message);
    }
    targetServerId = inserted.id;
    serverConfig = inserted;
  }

  let startedContainerId: string | null = null;

  const canAllocate = await resourceService.canAllocateMemory();
  if (!canAllocate) {
    throw new HttpError(
      503,
      'insufficient_resources',
      'The host does not have enough memory available to start this server.',
    );
  }

  try {
    const runtime = await dockerService.startMinecraftServer({
      eula: env.MINECRAFT_EULA,
      image: env.MINECRAFT_IMAGE,
      memory: serverConfig.memory || env.MINECRAFT_MEMORY,
      version: serverConfig.version,
      gameMode: serverConfig.game_mode,
      difficulty: serverConfig.difficulty,
      seed: serverConfig.seed,
      serverId: targetServerId,
      userId,
    });
    startedContainerId = runtime.containerId;

    let tunnelIp: string | null = null;
    let tunnelPort: number | null = null;

    const playitStaticIp = profile?.playit_minecraft_static_ip || profile?.playit_static_ip;
    if (playitStaticIp) {
      const parts = playitStaticIp.split(':');
      tunnelIp = parts[0] ?? null;
      tunnelPort = parts[1] ? parseInt(parts[1], 10) : null;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('servers')
      .update({
        container_id: runtime.containerId,
        status: 'running',
        tunnel_ip: tunnelIp,
        tunnel_port: tunnelPort,
      })
      .eq('id', targetServerId)
      .eq('user_id', userId)
      .select('*')
      .single<ServerRow>();

    if (updateError) {
      throw new HttpError(500, 'database_error', updateError.message);
    }

    // Reset idle strike count in Redis when starting
    const strikeKey = `idle_strike:${targetServerId}`;
    await redisConnection.del(strikeKey).catch((err) => {
      logger.error({ err, serverId: targetServerId }, 'Failed to clear idle strike key on start');
    });

    // Start tunnel asynchronously so we don't block the API response
    tunnelService
      .startPlayitTunnel(targetServerId, userId, playitSecret)
      .catch((err) => {
        logger.error({ err, serverId: targetServerId }, 'Failed to start Playit tunnel');
      });

    reply.code(201).send({ server: mapServer(updated) });
  } catch (error) {
    logger.error({ error, serverId: targetServerId }, 'Failed to start Minecraft container');

    if (startedContainerId) {
      await dockerService
        .stopManagedContainer(startedContainerId, targetServerId)
        .catch((stopError: unknown) => {
          logger.error(
            { error: stopError, serverId: targetServerId },
            'Failed to clean up started container',
          );
        });
    }

    await supabaseAdmin
      .from('servers')
      .update({
        status: 'offline',
      })
      .eq('id', targetServerId)
      .eq('user_id', userId);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, 'docker_start_failed', 'Failed to start Minecraft server.');
  }
}

export async function stopServer(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.authUser.id;
  const { id } = req.params as ServerIdParams;
  const server = await getOwnedServer(id, userId);

  if (server.status === 'offline') {
    reply.send({ server: mapServer(server) });
    return;
  }

  // Clear strike key when stopping
  const strikeKey = `idle_strike:${server.id}`;
  await redisConnection.del(strikeKey).catch((err) => {
    logger.error({ err, serverId: server.id }, 'Failed to clear idle strike key on stop');
  });

  await supabaseAdmin
    .from('servers')
    .update({ status: 'stopping' })
    .eq('id', server.id)
    .eq('user_id', userId);

  try {
    if (server.container_id) {
      await dockerService.stopManagedContainer(server.container_id, server.id);
    }
  } catch (err) {
    logger.error({ err, serverId: server.id }, 'Docker container stop failed or timed out during stopServer flow');
  }

  const { data: updated, error } = await supabaseAdmin
    .from('servers')
    .update({ status: 'offline' })
    .eq('id', server.id)
    .eq('user_id', userId)
    .select('*')
    .single<ServerRow>();

  if (error) {
    throw new HttpError(500, 'database_error', error.message);
  }

  reply.send({ server: mapServer(updated) });
}

export async function getServerStatus(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.authUser.id;
  const { id } = req.params as ServerIdParams;
  const server = await getOwnedServer(id, userId);

  const runtime = server.container_id
    ? await dockerService.inspectManagedContainer(server.container_id, server.id)
    : { containerState: null, hostPort: null };

  const stats = server.container_id && server.status === 'running'
    ? await resourceService.getContainerStats(server.container_id)
    : null;

  let idleTimeRemaining: number | null = null;
  if (server.status === 'running' || server.status === 'ready') {
    const strikeKey = `idle_strike:${server.id}`;
    const strikesStr = await redisConnection.get(strikeKey);
    if (strikesStr !== null) {
      // Strike key exists → server has been detected as idle at least once
      const strikes = parseInt(strikesStr, 10);
      idleTimeRemaining = Math.max(0, (2 - strikes) * 5);
    }
  }

  reply.send({
    server: mapServer(server),
    runtime,
    stats,
    idleTimeRemaining,
  });
}

export async function deleteServer(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.authUser.id;
  const { id } = req.params as ServerIdParams;
  const server = await getOwnedServer(id, userId);

  // Clear strike key when deleting
  const strikeKey = `idle_strike:${server.id}`;
  await redisConnection.del(strikeKey).catch((err) => {
    logger.error({ err, serverId: server.id }, 'Failed to clear idle strike key on delete');
  });

  // Stop + remove container and volumes
  if (server.container_id) {
    try {
      await dockerService.deleteManagedContainer(server.container_id, server.id);
    } catch (err) {
      logger.error(
        { err, serverId: server.id },
        'Failed to cleanup containers during server deletion',
      );
    }
  }

  // Delete the server record from the database
  const { error } = await supabaseAdmin
    .from('servers')
    .delete()
    .eq('id', server.id)
    .eq('user_id', userId);

  if (error) {
    throw new HttpError(500, 'database_error', error.message);
  }

  reply.code(204).send();
}
