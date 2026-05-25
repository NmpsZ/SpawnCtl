import { Github } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950/80 py-12 text-zinc-500 font-sans text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-bold text-stone-300 text-sm">SpawnCtl</p>
          <p className="mt-1">Self-Service Game Server Hosting Platform.</p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <span className="inline-flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
            Powered by Next.js & Fastify
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-stone-300 transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub Repository
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-8 pt-8 border-t border-zinc-900/60 text-center text-[10px] text-zinc-600">
        © {new Date().getFullYear()} SpawnCtl. All rights reserved. Self-hosted sandbox game servers.
      </div>
    </footer>
  );
}
