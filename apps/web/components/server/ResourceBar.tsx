'use client';

import { useServerStatus } from '../../hooks/useServerStatus';
import type { ServerRow } from '../../types';

export function ResourceBar({ serverId }: { serverId: string }) {
  const { data } = useServerStatus(serverId);

  if (!data?.runtime?.containerState) {
    return null;
  }

  const stats = data.stats;
  const isRunning = data.server.status === 'running' || data.server.status === 'ready';

  if (!isRunning || !stats) {
    return null;
  }

  const cpuPercent = stats.cpuPercentage.toFixed(1);
  const memoryUsageMb = (stats.memoryUsageBytes / 1024 / 1024).toFixed(0);
  const memoryLimitMb = (stats.memoryLimitBytes / 1024 / 1024).toFixed(0);

  // If memory limit is totally wild (like host limit without docker restriction), fallback to visual only
  const memoryPercent = Math.min((stats.memoryUsageBytes / stats.memoryLimitBytes) * 100, 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 animate-in fade-in duration-300">
      <div className="rounded-xl border border-zinc-900 bg-zinc-900/30 p-4 shadow-inner backdrop-blur-sm transition-all duration-300 hover:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">CPU Usage</span>
          <span className="text-xs font-mono font-bold text-zinc-200">{cpuPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-900">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500 ease-out rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]"
            style={{ width: `${Math.min(Number(cpuPercent), 100)}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-900 bg-zinc-900/30 p-4 shadow-inner backdrop-blur-sm transition-all duration-300 hover:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Memory Usage</span>
          <span className="text-xs font-mono font-bold text-zinc-200">
            {memoryUsageMb} <span className="text-zinc-500 font-sans">/ {memoryLimitMb} MB</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-900">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 ease-out rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
            style={{ width: `${memoryPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
