'use client';

import { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle2, Server, Globe, Cpu } from 'lucide-react';

type Step = {
  text: string;
  type: 'info' | 'success' | 'warn' | 'system';
  delay: number;
};

const DEPLOYMENT_STEPS: Step[] = [
  { text: '$ spawnctl create --game minecraft --ram 4G --name SpawnZone', type: 'system', delay: 400 },
  { text: 'Initializing SpawnCtl deployment engine...', type: 'info', delay: 600 },
  { text: 'Checking cluster resource guard: Available Memory (14.2GB) > Requested (4.0GB)... OK', type: 'info', delay: 700 },
  { text: 'Pulling Docker image: itzg/minecraft-server:latest...', type: 'info', delay: 1000 },
  { text: 'Creating isolated container: spawnctl-mc-spawnzone...', type: 'info', delay: 800 },
  { text: 'Container created successfully. ID: dq_c8e9b10a2', type: 'success', delay: 500 },
  { text: 'Launching twin playit.gg tunnel container for network bridging...', type: 'info', delay: 900 },
  { text: 'Acquired secure tunnel IP: 147.185.221.16', type: 'info', delay: 600 },
  { text: 'Acquired secure tunnel Port: 25565', type: 'info', delay: 400 },
  { text: 'Configuring server properties (difficulty: normal, mode: survival)...', type: 'info', delay: 500 },
  { text: 'Starting Minecraft Java engine (Spigot/Paper)...', type: 'info', delay: 800 },
  { text: '[INFO] Server permissions initialized.', type: 'info', delay: 300 },
  { text: '[INFO] Preparing spawn area: 85%', type: 'info', delay: 400 },
  { text: '[INFO] Done (2.415s)! For help, type "help"', type: 'info', delay: 300 },
  { text: '✨ SERVER DEPLOYED & LIVE!', type: 'success', delay: 400 },
  { text: '🔗 IP Address: 147.185.221.16:25565', type: 'success', delay: 200 },
];

export function MockTerminal() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentLogs, setCurrentLogs] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isRunning || stepIndex >= DEPLOYMENT_STEPS.length) {
      if (stepIndex >= DEPLOYMENT_STEPS.length) {
        setIsCompleted(true);
      }
      return;
    }

    const currentStep = DEPLOYMENT_STEPS[stepIndex];
    if (!currentStep) return;

    const timer = setTimeout(() => {
      setCurrentLogs((prev) => [...prev, currentStep]);
      setStepIndex((prev) => prev + 1);
    }, currentStep.delay);

    return () => clearTimeout(timer);
  }, [isRunning, stepIndex]);

  const handleStartSim = () => {
    setIsRunning(true);
    setIsCompleted(false);
    setCurrentLogs([]);
    setStepIndex(0);
  };

  return (
    <div className="relative w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-2xl shadow-emerald-500/5">
      {/* Decorative window controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-900/40 rounded-t-lg">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
          <Terminal className="h-3.5 w-3.5" />
          <span>deploy-simulator.sh</span>
        </div>
        <div className="w-12" /> {/* spacer */}
      </div>

      {/* Terminal Display */}
      <div className="h-72 overflow-y-auto px-5 py-4 font-mono text-[11px] leading-relaxed text-zinc-300">
        {currentLogs.length === 0 && !isRunning && (
          <div className="flex h-full flex-col items-center justify-center text-center gap-4">
            <div className="rounded-full bg-zinc-900 p-4 border border-zinc-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
              <Server className="h-8 w-8 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-stone-200">Interactive Deploy Simulator</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                Click below to watch SpawnCtl spin up an isolated Minecraft server with direct tunnel routing in real time.
              </p>
            </div>
            <button
              onClick={handleStartSim}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-950/20 transition-all hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Deploy Minecraft Server
            </button>
          </div>
        )}

        {currentLogs.map((log, idx) => {
          let colorClass = 'text-zinc-400';
          if (log.type === 'system') colorClass = 'text-emerald-400 font-bold';
          if (log.type === 'success') colorClass = 'text-indigo-400 font-semibold';
          if (log.type === 'warn') colorClass = 'text-amber-400';

          return (
            <div key={idx} className={`mb-1 transition-opacity duration-300 ${colorClass}`}>
              {log.text}
            </div>
          );
        })}

        {isRunning && !isCompleted && (
          <div className="inline-block h-3 w-1.5 animate-pulse bg-emerald-400 ml-0.5" />
        )}

        {isCompleted && (
          <div className="mt-4 rounded-lg bg-zinc-900/60 border border-emerald-500/20 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-950 p-1.5 border border-emerald-500/30">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-200">Server Running Fully Connected!</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Share with your friends and start crafting.</p>
              </div>
            </div>
            <button
              onClick={handleStartSim}
              className="rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2.5 py-1 text-[10px] text-stone-300 transition-colors shrink-0"
            >
              Run Again
            </button>
          </div>
        )}
      </div>

      {/* Decorative Specs Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-zinc-900 bg-zinc-950 text-[10px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1.5">
          <Cpu className="h-3 w-3" /> Dedicated resources: 4GB RAM / 2 vCPUs
        </span>
        <span className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 text-emerald-500" /> Playit Tunnel IP Enabled
        </span>
      </div>
    </div>
  );
}
