import type { GameType, ServerStatus } from '@deployquest/shared';

export type ServerRow = {
  id: string;
  user_id: string;
  game: GameType;
  status: ServerStatus;
  container_id: string | null;
  tunnel_ip: string | null;
  tunnel_port: number | null;
  created_at: string;
  updated_at: string;
};
