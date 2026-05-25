import type { ServerStatus } from '@deployquest/shared';

import { cn } from '../../lib/utils';

const statusClassName: Record<ServerStatus, string> = {
  offline: 'border-zinc-800 bg-zinc-900 text-zinc-400',
  starting: 'border-amber-500/20 bg-amber-500/10 text-amber-400 animate-pulse',
  running: 'border-sky-500/20 bg-sky-500/10 text-sky-400 animate-pulse',
  ready: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  stopping: 'border-rose-500/20 bg-rose-500/10 text-rose-450',
};

const statusDisplay: Record<ServerStatus, string> = {
  offline: 'Offline',
  starting: 'Starting',
  running: 'Booting',
  ready: 'Ready',
  stopping: 'Stopping',
};

export function ServerStatusBadge({ status }: { status: ServerStatus }) {
  return (
    <span
      className={cn(
        'inline-flex h-5.5 items-center rounded-full border px-2.5 text-[10px] font-extrabold uppercase tracking-wider',
        statusClassName[status],
      )}
    >
      {statusDisplay[status] || status}
    </span>
  );
}
