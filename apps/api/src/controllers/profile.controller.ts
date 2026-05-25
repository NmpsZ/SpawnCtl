import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Profile } from '@deployquest/shared';

import { HttpError } from '../lib/http-error.js';
import { supabaseAdmin } from '../lib/supabase.js';

export async function getProfile(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.authUser.id;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle<Profile>();

  if (error) {
    throw new HttpError(500, 'database_error', error.message);
  }

  // If no profile exists, return an empty structure
  if (!data) {
    return reply.send({
      profile: {
        id: userId,
        playit_secret: null,
        playit_static_ip: null,
        playit_minecraft_static_ip: null,
        playit_terraria_static_ip: null,
      },
    });
  }

  reply.send({ profile: data });
}

export async function updateProfile(
  req: FastifyRequest<{
    Body: {
      playit_secret?: string;
      playit_static_ip?: string;
      playit_minecraft_static_ip?: string;
      playit_terraria_static_ip?: string;
    };
  }>,
  reply: FastifyReply,
) {
  const userId = req.authUser!.id;
  const {
    playit_secret,
    playit_static_ip,
    playit_minecraft_static_ip,
    playit_terraria_static_ip,
  } = req.body;

  const updateFields: Record<string, any> = {
    id: userId,
    updated_at: new Date().toISOString(),
  };

  if (playit_secret !== undefined) {
    updateFields.playit_secret = playit_secret === '' ? null : playit_secret;
  }
  if (playit_static_ip !== undefined) {
    updateFields.playit_static_ip = playit_static_ip === '' ? null : playit_static_ip;
  }
  if (playit_minecraft_static_ip !== undefined) {
    updateFields.playit_minecraft_static_ip = playit_minecraft_static_ip === '' ? null : playit_minecraft_static_ip;
  }
  if (playit_terraria_static_ip !== undefined) {
    updateFields.playit_terraria_static_ip = playit_terraria_static_ip === '' ? null : playit_terraria_static_ip;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(updateFields, { onConflict: 'id' })
    .select()
    .single<Profile>();

  if (error) {
    throw new HttpError(500, 'database_error', error.message);
  }

  reply.send({ profile: data });
}
