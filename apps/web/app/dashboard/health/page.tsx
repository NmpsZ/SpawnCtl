'use client';

import { Activity, CheckCircle2, Cpu, Database, HardDrive, Server, Zap, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '../../../lib/api-client';
import { ServerStatusBadge } from '../../../components/server/ServerStatus';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ContainerPort {
  hostPort: number;
  containerPort: number;
  protocol: string;
}

interface ContainerInfo {
  containerId: string;
  name: string;
  image: string;
  state: string;
  status: string;
  game: string;
  serverId: string;
  dbStatus?: string;
  ports: ContainerPort[];
  created: number;
}

interface SystemHealthResponse {
  system: {
    dockerVersion: string;
    cpus: number;
    totalMemoryBytes: number;
    maxAllocatedMemoryMb: number;
    operatingSystem: string;
    storageDriver: string;
  };
  containers: ContainerInfo[];
  summary: {
    running: number;
    stopped: number;
    total: number;
  };
}

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HealthPage() {
  const { data, isLoading, error } = useQuery<SystemHealthResponse>({
    queryKey: ['system-health'],
    queryFn: () => apiFetch<SystemHealthResponse>('/api/v1/system-health'),
    refetchInterval: 5000,
  });

  const system = data?.system;
  const containers = data?.containers ?? [];
  const summary = data?.summary;

  const totalMemoryGb = system ? system.totalMemoryBytes / (1024 ** 3) : 0;
  const maxAllocGb = system ? system.maxAllocatedMemoryMb / 1024 : 0;

  return (
    <main className="min-w-0 space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-1 border-b border-zinc-900 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-stone-100 flex items-center gap-2">
          <Activity className="h-6 w-6 text-indigo-400 animate-pulse" />
          System Health
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Monitor your Docker host resource allocation, daemon connections, and physical node metrics in real-time.
        </p>
      </div>

      {/* Loading / Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-indigo-500" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">
          <AlertCircle className="h-5 w-5 text-rose-400" />
          <span className="text-sm">Failed to load system health data. Is the API server running?</span>
        </div>
      )}

      {data && (
        <>
          {/* Grid of Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Docker Info Card */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-48 shadow-lg group hover:border-zinc-800 transition-all">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-indigo-400" />
                  Docker Engine
                </span>
                <span className="text-2xl font-black text-indigo-400 tabular-nums">v{system!.dockerVersion}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wide">
                  <span>CPUs</span>
                  <span className="tabular-nums text-stone-300">{system!.cpus} Cores</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wide">
                  <span>Host OS</span>
                  <span className="text-stone-300 normal-case text-right max-w-[60%] truncate">{system!.operatingSystem}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wide">
                  <span>Storage Driver</span>
                  <span className="text-stone-300">{system!.storageDriver}</span>
                </div>
              </div>
            </div>

            {/* RAM Card */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-48 shadow-lg group hover:border-zinc-800 transition-all">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-emerald-400" />
                  Host Memory
                </span>
                <span className="text-2xl font-black text-emerald-400 tabular-nums">{totalMemoryGb.toFixed(1)} GB</span>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${(maxAllocGb / totalMemoryGb) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wide">
                  <span>Allocation Limit</span>
                  <span>{maxAllocGb.toFixed(1)} GB for game servers</span>
                </div>
              </div>
            </div>

            {/* Containers Summary Card */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-48 shadow-lg group hover:border-zinc-800 transition-all">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Server className="h-4 w-4 text-indigo-400" />
                  Containers
                </span>
                <span className="text-2xl font-black text-stone-200">{summary!.total}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Running
                  </span>
                  <span className="tabular-nums text-emerald-400 font-bold">{summary!.running}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-600" />
                    Stopped
                  </span>
                  <span className="tabular-nums text-zinc-400 font-bold">{summary!.stopped}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wide">
                  <span>Max Memory / Container</span>
                  <span className="text-stone-300">{maxAllocGb.toFixed(1)} GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Container Registry */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-6 backdrop-blur-md shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-stone-200 tracking-tight flex items-center gap-2">
                <Server className="h-4 w-4 text-indigo-400" />
                Active Container Registry
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Currently managed application containers on this Docker host.
              </p>
            </div>

            {containers.length === 0 ? (
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-6 text-center">
                <p className="text-sm text-zinc-500">No managed containers found. Start a server to see it here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {containers.map((c) => {
                  const isRunning = c.state === 'running';
                  const gameLabel = c.game === 'minecraft' ? 'Minecraft' : c.game === 'terraria' ? 'Terraria' : c.game;
                  const primaryPort = c.ports[0];

                  return (
                    <div
                      key={c.containerId}
                      className={`rounded-xl border p-4 flex items-center justify-between shadow-inner transition-all ${
                        isRunning
                          ? 'border-zinc-900 bg-zinc-950/40'
                          : 'border-zinc-900 bg-zinc-950/20 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-lg border flex items-center justify-center ${
                            isRunning
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                          }`}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v3.75a3 3 0 0 1-3 3m-13.5 0a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-3-3" />
                          </svg>
                        </div>
                        <div>
                          <div className={`text-xs font-bold flex items-center gap-2 ${isRunning ? 'text-stone-200' : 'text-zinc-400'}`}>
                            {c.name}
                            <ServerStatusBadge status={c.dbStatus || (isRunning ? 'running' : 'offline')} />
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {gameLabel}
                            </span>
                          </div>
                          <div className={`text-[10px] font-mono mt-1 ${isRunning ? 'text-zinc-500' : 'text-zinc-600'}`}>
                            CONTAINER ID: {c.containerId}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {primaryPort ? (
                          <>
                            <div className={`text-xs font-bold tabular-nums ${isRunning ? 'text-stone-200' : 'text-zinc-500'}`}>
                              {primaryPort.hostPort} → {primaryPort.containerPort}
                            </div>
                            <div className={`text-[10px] mt-0.5 uppercase tracking-wide font-semibold ${isRunning ? 'text-zinc-500' : 'text-zinc-600'}`}>
                              Port Map
                            </div>
                          </>
                        ) : (
                          <div className="text-[10px] text-zinc-600 uppercase tracking-wide font-semibold">
                            No ports
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-5 border-t border-zinc-900/60 flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              <span>Daemon Memory Limit</span>
              <span className="text-stone-300">{maxAllocGb.toFixed(2)} GB MAX PER CONTAINER</span>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
