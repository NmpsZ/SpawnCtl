import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../../..');
const apiRoot = path.resolve(__dirname, '../..');

dotenv.config({
  path: path.join(workspaceRoot, '.env'),
});
dotenv.config({
  override: true,
  path: path.join(apiRoot, '.env'),
});

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  DOCKER_HOST: z.string().optional(),
  DOCKER_SOCKET_PATH: z.string().optional(),
  MINECRAFT_EULA: z.literal('TRUE').default('TRUE'),
  MINECRAFT_IMAGE: z.string().min(1).default('itzg/minecraft-server:latest'),
  MINECRAFT_MEMORY: z.string().min(1).default('1G'),
  TERRARIA_IMAGE: z.string().min(1).default('beardedio/terraria:latest'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PLAYIT_SECRET_KEY: z.string().optional(),
  PLAYIT_STATIC_IP: z.string().optional(),
  START_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  START_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  MAX_ALLOCATED_MEMORY_MB: z.coerce.number().int().positive().default(4096),
});

export const env = envSchema.parse(process.env);
