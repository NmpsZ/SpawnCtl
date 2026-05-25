'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ServerStatsData } from '@deployquest/shared';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

const defaultStats: ServerStatsData = {
  cpuPercent: 0,
  memoryUsageMB: 0,
  memoryLimitMB: 0,
  memoryPercent: 0,
};

export function useServerStats(serverId: string) {
  const [stats, setStats] = useState<ServerStatsData>(defaultStats);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initSocket() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !mounted) return;

      const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
        auth: { token: session.access_token },
        withCredentials: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('subscribe:stats', serverId);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        setStats(defaultStats);
      });

      socket.on('server:stats', (data: ServerStatsData) => {
        setStats(data);
      });
    }

    initSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe:stats');
        socketRef.current.disconnect();
      }
    };
  }, [serverId]);

  return { isConnected, stats };
}
