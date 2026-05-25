'use client';

import { useState } from 'react';
import { Loader2, Layers, Copy, Clock } from 'lucide-react';

import { StartServerButton, StopServerButton } from './ServerControls';
import { ServerCardMenu } from './ServerCardMenu';
import { ServerStatusBadge } from './ServerStatus';
import type { ServerRow } from '../../types';
import { useServerStatus } from '../../hooks/useServerStatus';
import { useServerPlayers } from '../../hooks/useServerPlayers';
import { ServerPlayerBadge, ServerIdleWarning } from './ServerPlayerStatus';

export function ServerCard({ server }: { server: ServerRow }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const { data } = useServerStatus(server.id);
  const { isConnected, playersOnline, idleTimeRemaining } = useServerPlayers(server.id);

  const activeServer = (data?.server as any) ?? server;
  const displayIdleTime = isConnected && playersOnline !== -1 ? idleTimeRemaining : data?.idleTimeRemaining;

  async function copyIpToClipboard(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!tunnelAddress) return;
    try {
      await navigator.clipboard.writeText(tunnelAddress);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    } catch (err) {
      console.error('Failed to copy IP', err);
    }
  }

  const resolvedIp = activeServer.tunnelIp ?? activeServer.tunnel_ip;
  const resolvedPort = activeServer.tunnelPort ?? activeServer.tunnel_port;

  const tunnelAddress = resolvedIp
    ? resolvedPort
      ? `${resolvedIp}:${resolvedPort}`
      : resolvedIp
    : null;

  const isOffline = activeServer.status === 'offline';

  return (
    <article className={`group relative rounded-2xl border border-zinc-900 bg-zinc-900/35 hover:bg-zinc-900/50 hover:border-zinc-800/80 p-5 shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${menuOpen ? 'z-30' : 'z-10'}`}>
      {/* Subtle indicator bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all ${activeServer.game === 'minecraft'
          ? 'bg-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
          : 'bg-sky-500/80 shadow-[0_0_12px_rgba(14,165,233,0.4)]'
        }`} />

      <div className="flex items-start justify-between gap-4">
        {/* Left: clickable info area using native anchor */}
        <a
          href={`/servers/${activeServer.id}`}
          className="min-w-0 flex-1 flex gap-4 items-start"
          aria-label={`Open ${activeServer.game} server`}
        >
          {/* Game icon container */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeServer.game === 'minecraft' ? '/pic/minecraft_icon.png' : '/pic/terraria_icon.png'}
              alt={activeServer.game}
              className="h-10 w-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-stone-100 group-hover:text-indigo-400 transition-colors tracking-tight">
                {activeServer.name || activeServer.game}
              </h2>
              <span className={`rounded-md px-1.5 py-0.5 text-2xs font-extrabold tracking-wider uppercase border ${activeServer.game === 'minecraft'
                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
                  : 'bg-sky-950/30 text-sky-400 border-sky-500/20'
                }`}>
                {activeServer.game}
              </span>
              <ServerStatusBadge status={activeServer.status} />
              {activeServer.status !== 'offline' && (
                <ServerPlayerBadge playersOnline={playersOnline} size="sm" />
              )}
            </div>

            <p className="mt-1 font-mono text-[10px] text-zinc-600 truncate">{activeServer.id}</p>

            <div className="mt-3.5">
              {isOffline ? (
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-950/40 border border-zinc-900/60 px-2.5 py-1 rounded-md">
                  Offline
                </span>
              ) : activeServer.tunnel_ip?.startsWith('https://') ? (
                <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-md animate-pulse">
                  Claim Required
                </span>
              ) : tunnelAddress ? (
                <div className="flex flex-col gap-1 w-fit">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Public IP:</span>
                  <button
                    onClick={copyIpToClipboard}
                    className="group/ip relative flex items-center gap-2 font-mono text-xs font-bold text-stone-250 bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg shadow-inner transition-all hover:scale-[1.02] duration-200 text-left"
                    title="Click to copy IP Address"
                    type="button"
                  >
                    <span>{tunnelAddress}</span>
                    {copiedIp ? (
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-450 border border-emerald-500/20 px-1.5 py-0.5 rounded font-sans font-extrabold uppercase tracking-wider animate-in fade-in duration-200">
                        Copied!
                      </span>
                    ) : (
                      <Copy className="h-3 w-3 text-zinc-650 group-hover/ip:text-indigo-400 transition-colors" />
                    )}
                  </button>
                </div>
              ) : activeServer.status === 'starting' ? (
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-950/40 border border-zinc-900/60 px-2.5 py-1 rounded-md animate-pulse">
                  Tunnel pending…
                </span>
              ) : (
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider bg-rose-950/20 border border-rose-900/30 px-2.5 py-1 rounded-md">
                  No IP Configured
                </span>
              )}
            </div>
          </div>
        </a>

        {/* Right: action buttons */}
        <div className="flex shrink-0 items-center gap-2 self-center">
          {activeServer.status !== 'offline' ? (
            <StopServerButton serverId={activeServer.id} size="default" />
          ) : (
            <StartServerButton serverId={activeServer.id} game={activeServer.game} />
          )}

          <ServerCardMenu
            serverId={activeServer.id}
            game={activeServer.game}
            tunnelAddress={tunnelAddress}
            onOpenChange={setMenuOpen}
          />
        </div>
      </div>

      {/* Idle warning */}
      <ServerIdleWarning displayIdleTime={displayIdleTime} size="sm" />
    </article>
  );
}

