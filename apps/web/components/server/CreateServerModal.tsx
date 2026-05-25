'use client';

import { Plus, X, Server, Gamepad2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '../ui/button';
import { apiFetch } from '../../lib/api-client';

type GameType = 'minecraft' | 'terraria';

export function CreateServerModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('minecraft');
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [serverName, setServerName] = useState('My Server');
  const [memory, setMemory] = useState('1G');
  const [version, setVersion] = useState('LATEST');
  const [gameMode, setGameMode] = useState('survival');
  const [difficulty, setDifficulty] = useState('easy');
  const [seed, setSeed] = useState('');

  const selectGameAndResetVersion = (game: GameType) => {
    setSelectedGame(game);
    setVersion('LATEST');
  };

  async function handleCreate() {
    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = (await apiFetch('/api/v1/servers', {
        body: JSON.stringify({
          game: selectedGame,
          name: serverName || 'My Server',
          version,
          memory,
          gameMode,
          difficulty,
          seed: seed || undefined,
        }),
        method: 'POST',
      })) as { server: { id: string } };

      if (response && response.server && response.server.id) {
        setIsOpen(false);
        router.push(`/servers/${response.server.id}`);
        router.refresh();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create server.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <Button
        className="flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-extrabold rounded-xl px-4 py-2.5 shadow-lg shadow-indigo-950/40 transition-all hover:scale-[1.02]"
        onClick={() => {
          setIsOpen(true);
          setErrorMessage(null);
        }}
        type="button"
      >
        <Plus className="h-4.5 w-4.5" />
        Create Server
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              if (!isPending) setIsOpen(false);
            }}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-stone-100 shadow-2xl transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400">
                  <Server className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-extrabold text-stone-100 tracking-tight">
                  Deploy New Server
                </h2>
              </div>
              <button
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-stone-200 transition-colors"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="my-5 space-y-6">
              {/* Game select grid */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`relative flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all duration-300 ${
                    selectedGame === 'minecraft'
                      ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                  disabled={isPending}
                  onClick={() => selectGameAndResetVersion('minecraft')}
                  type="button"
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/pic/minecraft_icon.png"
                      alt="Minecraft"
                      className="h-10 w-10 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
                    />
                  </div>
                  <span className="font-bold tracking-tight">Minecraft</span>
                </button>

                <button
                  className={`relative flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all duration-300 ${
                    selectedGame === 'terraria'
                      ? 'border-sky-500/80 bg-sky-950/20 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                  disabled={isPending}
                  onClick={() => selectGameAndResetVersion('terraria')}
                  type="button"
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/pic/terraria_icon.png"
                      alt="Terraria"
                      className="h-10 w-10 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
                    />
                  </div>
                  <span className="font-bold tracking-tight">Terraria</span>
                </button>
              </div>

              {/* Server Settings Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Server Name</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors shadow-inner"
                    placeholder="My Awesome Server"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    disabled={isPending}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Memory (RAM)</label>
                    <select
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                      value={memory}
                      onChange={(e) => setMemory(e.target.value)}
                      disabled={isPending}
                    >
                      <option value="1G">1 GB (Basic)</option>
                      <option value="2G">2 GB (Recommended)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Version</label>
                    <select
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      disabled={isPending}
                    >
                      <option value="LATEST">Latest</option>
                      {selectedGame === 'minecraft' ? (
                        <>
                          <option value="1.20.4">1.20.4</option>
                          <option value="1.20.2">1.20.2</option>
                          <option value="1.19.4">1.19.4</option>
                          <option value="1.16.5">1.16.5</option>
                        </>
                      ) : (
                        <>
                          <option value="1.4.4.9">1.4.4.9</option>
                          <option value="1.4.3.6">1.4.3.6</option>
                          <option value="1.4.2.3">1.4.2.3</option>
                          <option value="1.3.5.3">1.3.5.3</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {selectedGame === 'minecraft' && (
                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 mt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Game Mode</label>
                      <select
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                        value={gameMode}
                        onChange={(e) => setGameMode(e.target.value)}
                        disabled={isPending}
                      >
                        <option value="survival">Survival</option>
                        <option value="creative">Creative</option>
                        <option value="adventure">Adventure</option>
                        <option value="spectator">Spectator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Difficulty</label>
                      <select
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        disabled={isPending}
                      >
                        <option value="peaceful">Peaceful</option>
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">World Seed (Optional)</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors shadow-inner"
                        placeholder="Leave blank for random"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 p-3.5 text-xs text-rose-400">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
              <Button
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                type="button"
                variant="outline"
                className="bg-zinc-800 hover:bg-zinc-750 text-stone-200 border-zinc-750 h-10.5 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                className={`transition-all duration-200 h-10.5 rounded-xl text-xs font-extrabold ${
                  selectedGame === 'minecraft'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-950/20'
                }`}
                disabled={isPending}
                onClick={handleCreate}
                type="button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline text-white" />
                    Deploying...
                  </>
                ) : (
                  'Deploy Server'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>

  );
}
