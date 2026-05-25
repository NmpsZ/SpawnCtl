'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Copy, Clock } from 'lucide-react';
import { Navbar } from '../layout/Navbar';
import { ResourceBar } from './ResourceBar';
import { StartServerButton, StopServerButton } from './ServerControls';
import { ServerStatusBadge } from './ServerStatus';
import { TerminalView } from './TerminalView';
import type { ServerRow } from '../../types';
import { useServerStatus } from '../../hooks/useServerStatus';
import { useServerPlayers } from '../../hooks/useServerPlayers';
import { ServerPlayerBadge, ServerIdleWarning } from './ServerPlayerStatus';

export function ServerDetailView({
  initialServer,
  userEmail,
}: {
  initialServer: ServerRow;
  userEmail: string;
}) {
  const [copiedIp, setCopiedIp] = useState(false);
  const { data } = useServerStatus(initialServer.id);
  const { isConnected, playersOnline, idleTimeRemaining } = useServerPlayers(initialServer.id);
  const activeServer = (data?.server as any) ?? initialServer;
  const isActive = activeServer.status !== 'offline';
  const displayIdleTime = isConnected && playersOnline !== -1 ? idleTimeRemaining : data?.idleTimeRemaining;

  const resolvedIp = activeServer.tunnelIp ?? activeServer.tunnel_ip;
  const resolvedPort = activeServer.tunnelPort ?? activeServer.tunnel_port;

  const tunnelAddress = resolvedIp
    ? resolvedPort
      ? `${resolvedIp}:${resolvedPort}`
      : resolvedIp
    : null;

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

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-100 antialiased selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <Navbar email={userEmail} />
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 relative z-10">
        {/* Back Link - Native a tag for robust navigation */}
        <div className="mb-2">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-stone-100 tracking-tight">
                {activeServer.name || <span className="capitalize">{activeServer.game} server</span>}
              </h1>
              <span className={`rounded-md px-1.5 py-0.5 text-2xs font-extrabold tracking-wider uppercase border ${
                activeServer.game === 'minecraft'
                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
                  : 'bg-sky-950/30 text-sky-400 border-sky-500/20'
              }`}>
                {activeServer.game}
              </span>
              <ServerStatusBadge status={activeServer.status} />
              {isActive && <ServerPlayerBadge playersOnline={playersOnline} />}
            </div>
            <p className="mt-1 font-mono text-[10px] text-zinc-650">{activeServer.id}</p>

            {isActive && (
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  SERVER IP:
                </span>
                {resolvedIp ? (
                  resolvedIp.startsWith('https://') ? (
                    <a
                      href={resolvedIp}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950/40 border border-indigo-500/20 px-3.5 py-1 text-2xs font-extrabold text-indigo-400 hover:bg-indigo-900/40 transition-colors animate-pulse"
                    >
                      Claim Your Server IP (Click to Link)
                    </a>
                  ) : (
                    <button
                      onClick={copyIpToClipboard}
                      className="group/ip relative flex items-center gap-2 font-mono text-xs font-bold text-stone-250 bg-zinc-950/85 hover:bg-zinc-950 border border-zinc-900 px-3.5 py-1.5 rounded-lg shadow-inner transition-all hover:scale-[1.02] duration-200 text-left"
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
                  )
                ) : activeServer.status === 'starting' ? (
                  <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-950/40 border border-zinc-900/60 px-2.5 py-1 rounded-md animate-pulse">
                    Tunnel pending…
                  </span>
                ) : (
                  <span className="text-2xs font-extrabold text-rose-450 uppercase tracking-wider bg-rose-950/20 border border-rose-900/30 px-2.5 py-1 rounded-md">
                    Tunnel IP not configured. Set in Settings
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 self-center">
            {isActive ? (
              <StopServerButton serverId={activeServer.id} />
            ) : (
              <StartServerButton serverId={activeServer.id} />
            )}
          </div>
        </div>

        <ServerIdleWarning displayIdleTime={displayIdleTime} />

        {isActive && <ResourceBar serverId={activeServer.id} />}

        <TerminalView serverId={activeServer.id} isRunning={isActive} />
      </main>
    </div>
  );
}
