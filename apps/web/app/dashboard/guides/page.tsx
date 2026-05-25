'use client';

import { BookOpen, Check, Copy, Gamepad2, HelpCircle, Terminal } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function GuidesPage() {
  const [activeTab, setActiveTab] = useState<'minecraft' | 'terraria'>('minecraft');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const faqs: FAQItem[] = [
    {
      question: 'Why does my server shut down automatically?',
      answer: 'To conserve CPU & Memory resources on the host machine, SpawnCtl runs a smart auto-shutdown scheduler. If your server remains completely empty (0 players) for more than 10 consecutive minutes, the system safely triggers a Docker container stop to prevent hardware exhaustion.',
    },
    {
      question: 'How do I set myself as Operator (OP) in Minecraft?',
      answer: 'Currently, server console commands are executed on startup or inside container logs. In our upcoming Phase 3 RCON release, you will be able to directly input commands like "/op username" inside the interactive server terminal on the details screen.',
    },
    {
      question: 'Do my friends need to install Playit.gg to connect?',
      answer: 'No! The Playit.gg agent runs entirely inside our cloud server, establishing a secure tunnel. Your friends only need to copy the standard IP address (e.g. name.ply.gg:12345) and paste it into their standard Minecraft or Terraria clients.',
    },
    {
      question: 'Can I add custom plugins or mods to the server?',
      answer: 'By default, we run lightweight Vanilla server engines optimized for stable play. Support for Spigot/Paper (Plugins) and Forge/Fabric (Mods) is planned in future roadmap updates, where you can select engine presets on creation.',
    },
  ];

  return (
    <main className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-zinc-900 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-stone-100 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-400" />
          Connection Guides
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Learn how to quickly connect to your spawned instances, run administrative tasks, and optimize your gameplay.
        </p>
      </div>

      {/* Tabs selector */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-px">
        <button
          onClick={() => setActiveTab('minecraft')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'minecraft'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-450 hover:text-stone-300'
          }`}
        >
          Minecraft Guide
        </button>
        <button
          onClick={() => setActiveTab('terraria')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === 'terraria'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-450 hover:text-stone-300'
          }`}
        >
          Terraria Guide
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'minecraft' ? (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 backdrop-blur-md shadow-xl space-y-5">
              <h2 className="text-base font-extrabold text-stone-200 tracking-tight flex items-center gap-2">
                <Gamepad2 className="h-4.5 w-4.5 text-indigo-400" />
                Connecting to Minecraft Server
              </h2>

              <ol className="relative border-l border-zinc-900 ml-3 space-y-6">
                <li className="pl-6 relative">
                  <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black text-indigo-400">
                    1
                  </span>
                  <h3 className="text-xs font-bold text-stone-200">Start your Instance</h3>
                  <p className="mt-1 text-xs text-zinc-450 leading-relaxed">
                    Navigate to your <a href="/dashboard" className="text-indigo-400 font-semibold hover:underline">Servers dashboard</a>, click on the **Start** button on your Minecraft card, and wait 30 seconds for the status to show <span className="text-emerald-450 font-semibold uppercase">Running</span>.
                  </p>
                </li>

                <li className="pl-6 relative">
                  <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black text-indigo-400">
                    2
                  </span>
                  <h3 className="text-xs font-bold text-stone-200 font-sans">Copy the Tunnel Address</h3>
                  <p className="mt-1 text-xs text-zinc-450 leading-relaxed">
                    Once running, copy the assigned **Playit IP Address** displayed in the card. It will resemble:
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-900/60 rounded-xl px-4 py-2.5 font-mono text-xs text-stone-300">
                    <span>fast-zombie.ply.gg:25565</span>
                    <button
                      onClick={() => handleCopy('fast-zombie.ply.gg:25565', 'mc-ip')}
                      className="text-zinc-500 hover:text-stone-200 transition-colors"
                      title="Copy IP"
                    >
                      {copiedText === 'mc-ip' ? <Check className="h-4 w-4 text-emerald-450" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </li>

                <li className="pl-6 relative">
                  <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black text-indigo-400">
                    3
                  </span>
                  <h3 className="text-xs font-bold text-stone-200">Connect in Client</h3>
                  <p className="mt-1 text-xs text-zinc-450 leading-relaxed">
                    Open Minecraft → Click **Multiplayer** → Select **Direct Connection** (or Add Server) → Paste the copied tunnel address, and hit **Join Server**!
                  </p>
                </li>
              </ol>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-5 backdrop-blur-md shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450">Minecraft Presets</h3>
            <div className="space-y-3.5 divide-y divide-zinc-900/60">
              <div className="flex justify-between text-xs pt-3.5 first:pt-0">
                <span className="text-zinc-500 font-semibold uppercase">Engine</span>
                <span className="text-stone-300 font-bold">itzg/minecraft-server (Docker)</span>
              </div>
              <div className="flex justify-between text-xs pt-3.5">
                <span className="text-zinc-500 font-semibold uppercase">Protocol</span>
                <span className="text-stone-300 font-bold">TCP / UDP (Playit Tunnel)</span>
              </div>
              <div className="flex justify-between text-xs pt-3.5">
                <span className="text-zinc-500 font-semibold uppercase">Game Version</span>
                <span className="text-stone-300 font-bold">Latest Stable (1.20+)</span>
              </div>
              <div className="flex justify-between text-xs pt-3.5">
                <span className="text-zinc-500 font-semibold uppercase">Default Port</span>
                <span className="text-indigo-400 font-mono font-bold">25565</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 backdrop-blur-md shadow-xl space-y-5">
              <h2 className="text-base font-extrabold text-stone-200 tracking-tight flex items-center gap-2">
                <Gamepad2 className="h-4.5 w-4.5 text-indigo-400" />
                Connecting to Terraria Server
              </h2>

              <ol className="relative border-l border-zinc-900 ml-3 space-y-6">
                <li className="pl-6 relative">
                  <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black text-indigo-400">
                    1
                  </span>
                  <h3 className="text-xs font-bold text-stone-200">Start your Instance</h3>
                  <p className="mt-1 text-xs text-zinc-450 leading-relaxed">
                    Head to your <a href="/dashboard" className="text-indigo-400 font-semibold hover:underline">Servers dashboard</a>, click **Start** on the Terraria card, and wait for the state indicator to shine <span className="text-emerald-450 font-semibold uppercase">Running</span>.
                  </p>
                </li>

                <li className="pl-6 relative">
                  <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black text-indigo-400">
                    2
                  </span>
                  <h3 className="text-xs font-bold text-stone-200">Separate Host and Port</h3>
                  <p className="mt-1 text-xs text-zinc-450 leading-relaxed">
                    Terraria requires entering the host IP and the port number separately inside its client menu:
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-900/60 rounded-xl px-4 py-2.5 font-mono text-xs text-stone-300">
                      <div className="flex gap-2">
                        <span className="text-zinc-500 uppercase font-sans font-bold">IP:</span>
                        <span>crazy-skeleton.ply.gg</span>
                      </div>
                      <button
                        onClick={() => handleCopy('crazy-skeleton.ply.gg', 'terr-ip')}
                        className="text-zinc-500 hover:text-stone-200 transition-colors"
                      >
                        {copiedText === 'terr-ip' ? <Check className="h-4 w-4 text-emerald-450" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-900/60 rounded-xl px-4 py-2.5 font-mono text-xs text-stone-300">
                      <div className="flex gap-2">
                        <span className="text-zinc-500 uppercase font-sans font-bold">Port:</span>
                        <span>7777</span>
                      </div>
                      <button
                        onClick={() => handleCopy('7777', 'terr-port')}
                        className="text-zinc-500 hover:text-stone-200 transition-colors"
                      >
                        {copiedText === 'terr-port' ? <Check className="h-4 w-4 text-emerald-450" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </li>

                <li className="pl-6 relative">
                  <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-black text-indigo-400">
                    3
                  </span>
                  <h3 className="text-xs font-bold text-stone-200">Connect in Client</h3>
                  <p className="mt-1 text-xs text-zinc-450 leading-relaxed">
                    Launch Terraria → Select **Multiplayer** → Select **Join via IP** → Choose a Character → Paste the IP Host address → Enter the Port → Hit **Connect**!
                  </p>
                </li>
              </ol>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-5 backdrop-blur-md shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450">Terraria Presets</h3>
            <div className="space-y-3.5 divide-y divide-zinc-900/60">
              <div className="flex justify-between text-xs pt-3.5 first:pt-0">
                <span className="text-zinc-500 font-semibold uppercase">Engine</span>
                <span className="text-stone-300 font-bold">beardedio/terraria (TShock)</span>
              </div>
              <div className="flex justify-between text-xs pt-3.5">
                <span className="text-zinc-500 font-semibold uppercase">Protocol</span>
                <span className="text-stone-300 font-bold">TCP only (Playit Tunnel)</span>
              </div>
              <div className="flex justify-between text-xs pt-3.5">
                <span className="text-zinc-500 font-semibold uppercase">API System</span>
                <span className="text-stone-300 font-bold">REST API TShock Engine</span>
              </div>
              <div className="flex justify-between text-xs pt-3.5">
                <span className="text-zinc-500 font-semibold uppercase">Default Port</span>
                <span className="text-indigo-400 font-mono font-bold">7777</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Interactive Accordion */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-6 backdrop-blur-md shadow-xl space-y-5">
        <div>
          <h2 className="text-base font-extrabold text-stone-200 tracking-tight flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-indigo-400" />
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Find immediate answers regarding automatic resources, tunnel mechanics, and administrative capabilities.
          </p>
        </div>

        <div className="grid gap-3">
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-zinc-900/70 bg-zinc-950/20 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left text-xs font-bold text-stone-200 hover:text-white hover:bg-zinc-900/30 transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <span className="text-zinc-500 font-mono font-bold text-sm">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4.5 text-xs text-zinc-450 leading-relaxed border-t border-zinc-900/60 pt-3 bg-zinc-950/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

