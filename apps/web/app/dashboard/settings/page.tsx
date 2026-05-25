'use client';

import { useState, useEffect } from 'react';
import { Loader2, Shield, Radio, Key, Gamepad2, Info } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { apiFetch } from '../../../lib/api-client';
import type { Profile } from '@deployquest/shared';

export default function SettingsPage() {
  const [secret, setSecret] = useState('');
  const [mcStaticIp, setMcStaticIp] = useState('');
  const [trStaticIp, setTrStaticIp] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSecret, setIsSavingSecret] = useState(false);
  const [isSavingMc, setIsSavingMc] = useState(false);
  const [isSavingTr, setIsSavingTr] = useState(false);

  const [messageSecret, setMessageSecret] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [messageMc, setMessageMc] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [messageTr, setMessageTr] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    apiFetch<{ profile: Profile }>('/api/v1/profile')
      .then((data) => {
        setSecret(data.profile.playit_secret || '');
        setMcStaticIp(data.profile.playit_minecraft_static_ip || data.profile.playit_static_ip || '');
        setTrStaticIp(data.profile.playit_terraria_static_ip || '');
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessageSecret({ type: 'error', text: 'Failed to load profile settings.' });
        setIsLoading(false);
      });
  }, []);

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSecret(true);
    setMessageSecret(null);

    try {
      await apiFetch<{ profile: Profile }>('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ playit_secret: secret }),
      });
      setMessageSecret({ type: 'success', text: 'Secret Key saved successfully!' });
    } catch (error: any) {
      setMessageSecret({ type: 'error', text: error.message || 'Failed to save Secret Key.' });
    } finally {
      setIsSavingSecret(false);
    }
  };

  const handleRemoveSecret = async () => {
    setIsSavingSecret(true);
    setMessageSecret(null);

    try {
      await apiFetch<{ profile: Profile }>('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ playit_secret: '' }),
      });
      setSecret('');
      setMessageSecret({ type: 'success', text: 'Secret Key removed.' });
    } catch (error: any) {
      setMessageSecret({ type: 'error', text: error.message || 'Failed to remove Secret Key.' });
    } finally {
      setIsSavingSecret(false);
    }
  };

  const handleSaveMinecraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMc(true);
    setMessageMc(null);

    try {
      await apiFetch<{ profile: Profile }>('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ playit_minecraft_static_ip: mcStaticIp }),
      });
      setMessageMc({ type: 'success', text: 'Minecraft static IP saved!' });
    } catch (error: any) {
      setMessageMc({ type: 'error', text: error.message || 'Failed to save Minecraft IP.' });
    } finally {
      setIsSavingMc(false);
    }
  };

  const handleRemoveMinecraft = async () => {
    setIsSavingMc(true);
    setMessageMc(null);

    try {
      await apiFetch<{ profile: Profile }>('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ playit_minecraft_static_ip: '' }),
      });
      setMcStaticIp('');
      setMessageMc({ type: 'success', text: 'Minecraft static IP removed.' });
    } catch (error: any) {
      setMessageMc({ type: 'error', text: error.message || 'Failed to remove Minecraft IP.' });
    } finally {
      setIsSavingMc(false);
    }
  };

  const handleSaveTerraria = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTr(true);
    setMessageTr(null);

    try {
      await apiFetch<{ profile: Profile }>('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ playit_terraria_static_ip: trStaticIp }),
      });
      setMessageTr({ type: 'success', text: 'Terraria static IP saved!' });
    } catch (error: any) {
      setMessageTr({ type: 'error', text: error.message || 'Failed to save Terraria IP.' });
    } finally {
      setIsSavingTr(false);
    }
  };

  const handleRemoveTerraria = async () => {
    setIsSavingTr(true);
    setMessageTr(null);

    try {
      await apiFetch<{ profile: Profile }>('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ playit_terraria_static_ip: '' }),
      });
      setTrStaticIp('');
      setMessageTr({ type: 'success', text: 'Terraria static IP removed.' });
    } catch (error: any) {
      setMessageTr({ type: 'error', text: error.message || 'Failed to remove Terraria IP.' });
    } finally {
      setIsSavingTr(false);
    }
  };

  return (
    <main className="min-w-0 space-y-6">
      <div className="flex flex-col gap-1 border-b border-zinc-900 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-stone-100">Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-400">Configure your personal integrations and preferences.</p>
      </div>

      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-6 backdrop-blur-md shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-stone-200 tracking-tight">Playit.gg Integration</h2>
            <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed">
              Connect a single Playit.gg Secret Key and configure separate static tunnel addresses for each game.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary Secret Key Card */}
            <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-zinc-900/60 pb-3">
                <Key className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-stone-200 tracking-tight">Global Agent Secret Key</h3>
              </div>

              <form onSubmit={handleSaveSecret} className="space-y-4 max-w-2xl">
                <div>
                  <label htmlFor="playit_secret" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Secret Key
                  </label>
                  <input
                    id="playit_secret"
                    type="password"
                    disabled={isSavingSecret}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Paste your playit.gg Secret Key here..."
                    className="mt-1.5 block w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors shadow-inner disabled:opacity-50"
                  />
                  <p className="mt-1.5 text-[10px] text-zinc-500">
                    This key identifies your playit agent, which manages tunnels for all your games automatically.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSavingSecret || !secret}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl px-4 h-9 shadow-md shadow-indigo-950/20 text-xs transition-all hover:scale-[1.01]"
                  >
                    {isSavingSecret && <Loader2 className="mr-1.5 h-3 w-3 animate-spin inline text-white" />}
                    Save Secret Key
                  </Button>
                  {secret && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveSecret}
                      disabled={isSavingSecret}
                      className="bg-zinc-900 hover:bg-zinc-800 text-stone-300 border-zinc-850 h-9 rounded-xl text-xs font-bold px-4"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {messageSecret && (
                  <p className={`text-[11px] font-bold mt-2 ${messageSecret.type === 'error' ? 'text-rose-400' : 'text-emerald-450'}`}>
                    {messageSecret.text}
                  </p>
                )}
              </form>
            </div>

            {/* Split Tunnel Address Card Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Minecraft Tunnel Address */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4 transition-all hover:border-zinc-850">
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">Minecraft Tunnel</h3>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900/60 px-2 py-0.5 rounded-full">
                    TCP/UDP • 25565
                  </span>
                </div>

                <form onSubmit={handleSaveMinecraft} className="space-y-4">
                  <div>
                    <label htmlFor="playit_mc_static_ip" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Tunnel Address
                    </label>
                    <input
                      id="playit_mc_static_ip"
                      type="text"
                      disabled={isSavingMc}
                      value={mcStaticIp}
                      onChange={(e) => setMcStaticIp(e.target.value)}
                      placeholder="e.g. mc-server.ply.gg:25565"
                      className="mt-1.5 block w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors shadow-inner disabled:opacity-50"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={isSavingMc || !mcStaticIp}
                      className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-xl px-4 h-9 shadow-md shadow-emerald-950/20 text-xs transition-all hover:scale-[1.01]"
                    >
                      {isSavingMc && <Loader2 className="mr-1.5 h-3 w-3 animate-spin inline text-white" />}
                      Save Minecraft IP
                    </Button>
                    {mcStaticIp && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveMinecraft}
                        disabled={isSavingMc}
                        className="bg-zinc-900 hover:bg-zinc-800 text-stone-300 border-zinc-850 h-9 rounded-xl text-xs font-bold px-4"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {messageMc && (
                    <p className={`text-[11px] font-bold mt-2 ${messageMc.type === 'error' ? 'text-rose-400' : 'text-emerald-450'}`}>
                      {messageMc.text}
                    </p>
                  )}
                </form>
              </div>

              {/* Terraria Tunnel Address */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4 transition-all hover:border-zinc-850">
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-md shadow-cyan-500/50" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">Terraria Tunnel</h3>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900/60 px-2 py-0.5 rounded-full">
                    TCP • 7777
                  </span>
                </div>

                <form onSubmit={handleSaveTerraria} className="space-y-4">
                  <div>
                    <label htmlFor="playit_tr_static_ip" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Tunnel Address
                    </label>
                    <input
                      id="playit_tr_static_ip"
                      type="text"
                      disabled={isSavingTr}
                      value={trStaticIp}
                      onChange={(e) => setTrStaticIp(e.target.value)}
                      placeholder="e.g. terraria-server.ply.gg:7777"
                      className="mt-1.5 block w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors shadow-inner disabled:opacity-50"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={isSavingTr || !trStaticIp}
                      className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-extrabold rounded-xl px-4 h-9 shadow-md shadow-cyan-950/20 text-xs transition-all hover:scale-[1.01]"
                    >
                      {isSavingTr && <Loader2 className="mr-1.5 h-3 w-3 animate-spin inline text-white" />}
                      Save Terraria IP
                    </Button>
                    {trStaticIp && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveTerraria}
                        disabled={isSavingTr}
                        className="bg-zinc-900 hover:bg-zinc-800 text-stone-300 border-zinc-850 h-9 rounded-xl text-xs font-bold px-4"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {messageTr && (
                    <p className={`text-[11px] font-bold mt-2 ${messageTr.type === 'error' ? 'text-rose-400' : 'text-emerald-450'}`}>
                      {messageTr.text}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-zinc-950 border border-zinc-900/60 p-4">
          <div className="flex gap-2.5 text-xs text-zinc-400">
            <Info className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-stone-200">Playit.gg Integration Steps</h4>
              <p className="leading-relaxed">
                1. Sign up or log in at <a href="https://playit.gg" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 font-semibold underline decoration-indigo-500/30">playit.gg</a>.<br />
                2. Under your dashboard, create game tunnels (Minecraft uses standard TCP/UDP ports, Terraria uses TCP).<br />
                3. Retrieve your Playit **Secret Key**, paste it in the Global Agent Secret Key field above.<br />
                4. Fill the corresponding **Tunnel Address** (static IP) for Minecraft and Terraria separately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
