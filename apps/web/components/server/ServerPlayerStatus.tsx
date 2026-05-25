import { Users, Clock } from 'lucide-react';

export function ServerPlayerBadge({
  playersOnline,
  size = 'default',
}: {
  playersOnline: number;
  size?: 'default' | 'sm';
}) {
  if (playersOnline < 0) return null;

  return (
    <span
      className={`flex items-center gap-1.5 font-semibold text-zinc-300 bg-zinc-950/60 border border-zinc-800/80 rounded-md shadow-sm ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <Users className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-zinc-500`} />
      <span className="text-emerald-400">{playersOnline}</span>
      <span
        className={`text-zinc-500 font-normal uppercase tracking-wider ml-0.5 ${
          size === 'sm' ? 'text-[10px]' : 'text-xs ml-1'
        }`}
      >
        Online
      </span>
    </span>
  );
}

export function ServerIdleWarning({
  displayIdleTime,
  size = 'default',
}: {
  displayIdleTime: number | null | undefined;
  size?: 'default' | 'sm';
}) {
  if (displayIdleTime === undefined || displayIdleTime === null) return null;

  if (size === 'sm') {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
        <Clock
          className={`h-3.5 w-3.5 text-amber-400 shrink-0 ${
            displayIdleTime === 0 ? 'animate-spin [animation-duration:3s]' : 'animate-pulse'
          }`}
        />
        <span className="text-xs text-amber-200/90 font-medium">
          {displayIdleTime === 0
            ? 'Idle — shutting down in a few seconds...'
            : `Idle — auto-shutdown in ~${displayIdleTime} min`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-200">
      <Clock
        className={`h-5 w-5 text-amber-400 ${
          displayIdleTime === 0 ? 'animate-spin [animation-duration:3s]' : 'animate-pulse'
        }`}
      />
      <div>
        <p className="font-bold">Server is currently idle</p>
        <p className="text-sm opacity-80">
          {displayIdleTime === 0
            ? 'Shutting down in a few seconds to save resources...'
            : `No players connected. Auto-shutdown in ~${displayIdleTime} minutes to save resources.`}
        </p>
      </div>
    </div>
  );
}
