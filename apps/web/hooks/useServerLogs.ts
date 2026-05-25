'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

const MAX_LINES = 500;

export function useServerLogs(serverId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lines, setLines] = useState<string[]>(['Connecting to log stream...']);
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
        setLines(['[System] Connected to log stream.']);
        socket.emit('subscribe:logs', serverId);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        setLines((prev) => [...prev, '[System] Disconnected from log stream.']);
      });

      socket.on('server:logs', (line: string) => {
        setLines((prev) => {
          const next = [...prev, line];
          if (next.length > MAX_LINES) {
            return next.slice(next.length - MAX_LINES);
          }
          return next;
        });
      });
    }

    initSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverId]);

  return { isConnected, lines };
}
