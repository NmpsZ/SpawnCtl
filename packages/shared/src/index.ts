export const GAME_TYPES = ['minecraft', 'terraria'] as const;
export type GameType = (typeof GAME_TYPES)[number];

export const SERVER_STATUSES = ['offline', 'starting', 'running', 'stopping', 'ready'] as const;
export type ServerStatus = (typeof SERVER_STATUSES)[number];

export interface ServerRecord {
  id: string;
  userId: string;
  name: string;
  game: GameType;
  status: ServerStatus;
  version: string;
  memory: string;
  gameMode: string;
  difficulty: string;
  seed: string | null;
  containerId: string | null;
  tunnelIp: string | null;
  tunnelPort: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  playit_secret: string | null;
  playit_static_ip: string | null;
  playit_minecraft_static_ip?: string | null;
  playit_terraria_static_ip?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartMinecraftServerRequest {
  name?: string;
}

export interface CreateServerRequest {
  name: string;
  game: GameType;
  version: string;
  memory: string;
  gameMode: string;
  difficulty: string;
  seed?: string;
}

export interface ServerResponse {
  server: ServerRecord;
}

export interface ServerStatusResponse {
  server: ServerRecord;
  runtime: {
    containerState: string | null;
    hostPort: number | null;
  };
  stats?: {
    cpuPercentage: number;
    memoryUsageBytes: number;
    memoryLimitBytes: number;
  } | null;
  idleTimeRemaining?: number | null;
}

export interface ServerStatsData {
  cpuPercent: number;
  memoryUsageMB: number;
  memoryLimitMB: number;
  memoryPercent: number;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
