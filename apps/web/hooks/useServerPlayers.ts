'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

export interface ServerPlayersData {
  playersOnline: number;
  idleTimeRemaining: number | null;
}

const defaultData: ServerPlayersData = {
  playersOnline: -1,
  idleTimeRemaining: null,
};

export function useServerPlayers(serverId: string) {
  const [data, setData] = useState<ServerPlayersData>(defaultData);
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
        transports: ['websocket'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('subscribe:players', serverId);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        // Don't reset data on disconnect to prevent UI flickering during short reconnects
      });

      socket.on('server:players', (payload: ServerPlayersData) => {
        setData(payload);
      });
    }

    initSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe:players');
        socketRef.current.disconnect();
      }
    };
  }, [serverId]);

  return { isConnected, playersOnline: data.playersOnline, idleTimeRemaining: data.idleTimeRemaining };
}
