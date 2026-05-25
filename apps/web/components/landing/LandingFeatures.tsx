import { Zap, ShieldCheck, Moon, BarChart3, HelpCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'One-Click Docker Spawn',
    desc: 'Each server is booted in a fully sandboxed Docker container within seconds. Zero config, zero commands, absolute isolation.',
    color: 'text-amber-400 bg-amber-950/40 border-amber-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Playit.gg Tunneling',
    desc: 'No port forwarding, no home IP exposure. SpawnCtl spins up a companion Playit.gg tunnel container providing a public IP instantly.',
    color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/20',
  },
  {
    icon: Moon,
    title: 'Automated Cost Savings',
    desc: 'Smart Sleep Protocol regularly queries the player counts. If the server is empty for consecutive intervals, it sleeps automatically.',
    color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Telemetry',
    desc: 'Monitor resource spikes inside the web console. Stream live container stats (CPU percentage, memory usage) directly in your panel.',
    color: 'text-rose-400 bg-rose-950/40 border-rose-500/20',
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-400">
          <Zap className="h-3.5 w-3.5" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-100">
          Engineered for Players
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-zinc-400">
          Ditch the complicated command lines and port forwarding. SpawnCtl features everything you need to run server clusters seamlessly.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feat, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/50 p-6 transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20"
          >
            <div className={`inline-flex items-center justify-center rounded-xl border p-3 ${feat.color}`}>
              <feat.icon className="h-5 w-5" />
            </div>

            <h3 className="mt-5 text-base font-bold text-stone-100 group-hover:text-white transition-colors">
              {feat.title}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
