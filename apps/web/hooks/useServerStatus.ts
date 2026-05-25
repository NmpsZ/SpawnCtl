'use client';

import type { ServerStatusResponse } from '@deployquest/shared';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '../lib/api-client';

export function useServerStatus(serverId: string) {
  return useQuery({
    enabled: Boolean(serverId),
    queryFn: () => apiFetch<ServerStatusResponse>(`/api/v1/servers/${serverId}/status`),
    queryKey: ['server-status', serverId],
    refetchInterval: 5000,
  });
}
