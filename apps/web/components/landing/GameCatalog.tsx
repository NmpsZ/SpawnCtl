import { Sparkles, Gamepad2, ArrowUpRight } from 'lucide-react';

interface GameItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  status: 'active' | 'soon';
  color: 'emerald' | 'indigo' | 'zinc';
  features: string[];
}

const SUPPORTED_GAMES: GameItem[] = [
  {
    id: 'minecraft',
    name: 'Minecraft',
    desc: 'Spawn a high-performance Java or Bedrock server. Includes customizable RAM settings, version control, and custom server properties.',
    badge: 'Fully Supported',
    status: 'active',
    color: 'emerald',
    features: ['Java & Bedrock Support', 'Configurable Memory (1G-8G)', 'Playit Tunnel Enabled', 'Automatic Sleep Mode'],
  },
  {
    id: 'terraria',
    name: 'Terraria',
    desc: 'Experience pure gaming adventure. Spin up an official Terraria Vanilla or TShock server container fully preconfigured in a single click.',
    badge: 'Fully Supported',
    status: 'active',
    color: 'indigo',
    features: ['Vanilla & TShock Support', 'Instant World Generation', 'Automated Network Porting', 'RLS Security Isolated'],
  },
  {
    id: 'palworld',
    name: 'Palworld',
    desc: 'Host your own Palworld dedicated servers. Catch, gather, build, and fight with your friends in a sandboxed, lag-free world.',
    badge: 'Coming Soon',
    status: 'soon',
    color: 'zinc',
    features: ['Dedicated Port Routing', 'Pal World Configurator', 'Server Stats Monitoring', 'Automated Backup Systems'],
  },
  {
    id: 'valheim',
    name: 'Valheim',
    desc: 'Deploy high-performance Viking server containers. Brave the elements, battle monsters, and establish your legacy.',
    badge: 'Coming Soon',
    status: 'soon',
    color: 'zinc',
    features: ['Viking World Auto-save', 'SteamCMD Bridge Integration', 'Memory Resource Guard', '24/7 Persistent Storage'],
  },
];

export function GameCatalog({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <section id="games" className="py-20 border-t border-zinc-900 bg-zinc-950/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-400">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Supported Game Catalog</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-100">
            Choose Your Quest
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-zinc-400">
            Deploy quests in your favorite games. Choose a template below to deploy an ultra-secure, containerized environment instantly.
          </p>
        </div>

        {/* Catalog Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {SUPPORTED_GAMES.map((game) => {
            const isActive = game.status === 'active';
            
            // Color scheme classes
            const borderGlow = game.color === 'emerald' 
              ? 'hover:border-emerald-500/50 hover:shadow-emerald-500/5' 
              : game.color === 'indigo'
              ? 'hover:border-indigo-500/50 hover:shadow-indigo-500/5'
              : 'hover:border-zinc-700';

            const badgeColor = game.color === 'emerald'
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/20'
              : game.color === 'indigo'
              ? 'bg-indigo-950/80 text-indigo-400 border-indigo-500/20'
              : 'bg-zinc-900 text-zinc-500 border-zinc-800';

            return (
              <div
                key={game.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-zinc-900/20 p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 ${
                  isActive 
                    ? 'border-zinc-800 hover:bg-zinc-900/40 hover:-translate-y-0.5' 
                    : 'border-zinc-900/60 opacity-60'
                } ${borderGlow}`}
              >
                {/* Top content */}
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${badgeColor}`}>
                      {game.status === 'active' && <Sparkles className="h-3 w-3" />}
                      {game.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl sm:text-2xl font-bold text-stone-100 capitalize">
                    {game.name}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                    {game.desc}
                  </p>

                  {/* Bullet list */}
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {game.features.map((feat, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs text-zinc-500">
                        <div className={`h-1.5 w-1.5 rounded-full ${isActive ? (game.color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500') : 'bg-zinc-700'}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to action */}
                <div className="mt-8 pt-6 border-t border-zinc-900/80">
                  {isActive ? (
                    <a
                      href={isLoggedIn ? '/dashboard' : '/signup'}
                      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 ${
                        game.color === 'emerald'
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20 hover:shadow-emerald-500/20'
                          : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/20 hover:shadow-indigo-500/20'
                      }`}
                    >
                      <span>Deploy {game.name} Server</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <div className="flex w-full items-center justify-center rounded-xl bg-zinc-900/40 border border-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-500 cursor-not-allowed">
                      Coming Soon to SpawnCtl
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
