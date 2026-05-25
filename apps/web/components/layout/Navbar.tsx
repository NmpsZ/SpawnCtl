import { LogOut, Server, Settings } from 'lucide-react';

import { Button } from '../ui/button';

export function Navbar({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-950/30 group-hover:scale-105 transition-transform duration-200">
            <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v3.75a3 3 0 0 1-3 3m-13.5 0a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-3-3" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-stone-100 group-hover:text-white transition-colors">
            Spawn<span className="text-indigo-400">Ctl</span>
          </span>
        </a>

        {/* Right Menu Controls */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden max-w-48 truncate text-xs font-semibold tracking-wider uppercase text-zinc-500 sm:block">
            {email}
          </span>

          <a href="/dashboard/settings" aria-label="Settings" title="Settings">
            <Button
              size="icon"
              variant="ghost"
              type="button"
              className="h-9 w-9 text-zinc-400 hover:text-stone-100 hover:bg-zinc-900/60 rounded-lg transition-colors"
            >
              <Settings className="h-4.5 w-4.5" />
            </Button>
          </a>

          <form action="/api/auth/sign-out" method="post">
            <Button
              aria-label="Sign out"
              size="icon"
              title="Sign out"
              type="submit"
              variant="ghost"
              className="h-9 w-9 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900/60 rounded-lg transition-colors"
            >
              <LogOut className="h-4.5 w-4.5" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

