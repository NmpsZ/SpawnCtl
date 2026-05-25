import { ArrowRight, Server, Shield, Sparkles, Terminal, Gamepad2, Layers } from 'lucide-react';

import { LandingNavbar } from '../components/landing/LandingNavbar';
import { MockTerminal } from '../components/landing/MockTerminal';
import { GameCatalog } from '../components/landing/GameCatalog';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingFooter } from '../components/landing/LandingFooter';
import { createSupabaseServerClient } from '../lib/supabase/server';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-stone-100 antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <LandingNavbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Hero Left: Headlines & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-semibold text-stone-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Next-Gen Gaming Infrastructure</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-stone-50 via-stone-100 to-zinc-400">
                Deploy Game Servers <br className="hidden sm:inline" />
                <span className="text-indigo-400">In 60 Seconds.</span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-base sm:text-lg text-zinc-400 leading-relaxed">
                Experience self-service game hosting redefined. Spawn isolated Minecraft or Terraria servers instantly with built-in playit.gg tunnels. No configurations, no port forwarding.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {user ? (
                  <a
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition-all hover:scale-[1.02]"
                  >
                    <span>Enter Player Panel</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <a
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition-all hover:scale-[1.02]"
                  >
                    <span>Start Your Quest (Free)</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                <a
                  href="#games"
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-6 py-3.5 text-sm font-semibold text-stone-200 transition-all"
                >
                  Explore Catalog
                </a>
              </div>
            </div>

            {/* Hero Right: Interactive Simulator */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <MockTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <LandingFeatures />

      {/* Supported Catalog */}
      <GameCatalog isLoggedIn={!!user} />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 border-t border-zinc-900">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-400">
            <Layers className="h-3.5 w-3.5" />
            <span>Workflow Journey</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-100">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-zinc-400">
            A three-step loop to launch, map, and play. We take care of all resource scheduling and public networking.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-6 bg-zinc-950 border border-zinc-900 rounded-2xl relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-bold text-lg">
              1
            </div>
            <h3 className="mt-5 text-base font-bold text-stone-200">Authenticate Your Profile</h3>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Sign in with your Google or GitHub account to claim your personal secure game server panel instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-6 bg-zinc-950 border border-zinc-900 rounded-2xl relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold text-lg">
              2
            </div>
            <h3 className="mt-5 text-base font-bold text-stone-200">Choose and Allocate Specs</h3>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Select your template (Minecraft/Terraria), customize your world, allocate memory sizes, and hit Launch.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-6 bg-zinc-950 border border-zinc-900 rounded-2xl relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-950 border border-amber-500/30 text-amber-400 font-bold text-lg">
              3
            </div>
            <h3 className="mt-5 text-base font-bold text-stone-200">Connect and Invite Friends</h3>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Copy your secure Playit.gg static server IP, paste it in-game, and start playing with your friends immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}

