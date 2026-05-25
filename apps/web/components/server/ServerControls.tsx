'use client';

import { Play, Square, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '../ui/button';
import { apiFetch } from '../../lib/api-client';
import type { GameType } from '@deployquest/shared';

export function StartServerButton({
  disabled,
  serverId: _serverId,
  game = 'minecraft',
  size = 'default',
}: {
  disabled?: boolean;
  serverId: string;
  game?: GameType;
  size?: 'default' | 'icon';
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function start() {
    setIsPending(true);
    setErrorMessage(null);

    try {
      await apiFetch(`/api/v1/servers/${game}/start`, {
        body: JSON.stringify({}),
        method: 'POST',
      });
    } catch (error: any) {
      if (error.message?.includes('playit_secret_required') || error.code === 'playit_secret_required') {
        router.push('/dashboard/settings');
      } else {
        setErrorMessage(error.message || 'Failed to start server.');
      }
    } finally {
      setIsPending(false);
      await queryClient.invalidateQueries({ queryKey: ['server-status'] });
      router.refresh();
    }
  }

  return (
    <div className="grid justify-items-end gap-2">
      <Button disabled={disabled || isPending} onClick={start} size={size} type="button">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {size !== 'icon' && (isPending ? 'Starting…' : 'Start')}
      </Button>
      {errorMessage ? (
        <p className="max-w-72 text-right text-sm text-rose-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}

export function StopServerButton({
  disabled,
  serverId,
  size = 'icon',
}: {
  disabled?: boolean;
  serverId: string;
  size?: 'default' | 'icon';
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function stop() {
    setIsPending(true);
    setErrorMessage(null);

    try {
      await apiFetch(`/api/v1/servers/${serverId}/stop`, {
        body: JSON.stringify({}),
        method: 'POST',
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to stop server.');
    } finally {
      setIsPending(false);
      await queryClient.invalidateQueries({ queryKey: ['server-status'] });
      router.refresh();
    }
  }

  return (
    <div className="grid justify-items-end gap-2">
      <Button
        aria-label="Stop server"
        disabled={disabled || isPending}
        onClick={stop}
        size={size}
        title="Stop server"
        type="button"
        variant="destructive"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Square className="h-4 w-4" />
        )}
        {size !== 'icon' && (isPending ? 'Stopping…' : 'Stop')}
      </Button>
      {errorMessage ? (
        <p className="max-w-72 text-right text-sm text-rose-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}

