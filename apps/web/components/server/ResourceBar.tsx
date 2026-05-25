'use client';

import { useServerStatus } from '../../hooks/useServerStatus';
import type { ServerRow } from '../../types';

export function ResourceBar({ serverId }: { serverId: string }) {
  const { data } = useServerStatus(serverId);

  if (!data?.runtime?.containerState) {
    return null;
  }

  const stats = data.stats;
  const isRunning = data.server.status === 'running';

  if (!isRunning || !stats) {
    return null;
  }

  const cpuPercent = stats.cpuPercentage.toFixed(1);
  const memoryUsageMb = (stats.memoryUsageBytes / 1024 / 1024).toFixed(0);
  const memoryLimitMb = (stats.memoryLimitBytes / 1024 / 1024).toFixed(0);

  // If memory limit is totally wild (like host limit without docker restriction), fallback to visual only
  const memoryPercent = Math.min((stats.memoryUsageBytes / stats.memoryLimitBytes) * 100, 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">CPU Usage</span>
          <span className="text-sm font-medium text-stone-900">{cpuPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(Number(cpuPercent), 100)}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Memory Usage</span>
          <span className="text-sm font-medium text-stone-900">
            {memoryUsageMb} <span className="text-stone-400">/ {memoryLimitMb} MB</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${memoryPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
