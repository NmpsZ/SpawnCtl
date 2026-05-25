'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, Settings } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export function LandingNavbar({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-950/30 group-hover:scale-105 transition-transform duration-200">
            <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v3.75a3 3 0 0 1-3 3m-13.5 0a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-3-3" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-stone-100 group-hover:text-white transition-colors">
            Spawn<span className="text-indigo-400">Ctl</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-stone-100 transition-colors">Features</a>
          <a href="#games" className="hover:text-stone-100 transition-colors">Supported Games</a>
          <a href="#how-it-works" className="hover:text-stone-100 transition-colors">How It Works</a>
        </nav>

        {/* Desktop CTA Buttons / Logged-in Info */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-48 truncate text-xs font-semibold tracking-wider uppercase text-zinc-500 sm:block">
                {user.email}
              </span>

              <a href="/dashboard/settings" aria-label="Settings" title="Settings">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center text-zinc-400 hover:text-stone-100 hover:bg-zinc-900/60 rounded-lg transition-colors"
                >
                  <Settings className="h-4.5 w-4.5" />
                </button>
              </a>

              <form action="/api/auth/sign-out" method="post" className="m-0">
                <button
                  type="submit"
                  title="Sign Out"
                  className="inline-flex h-9 w-9 items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-zinc-900/60 rounded-lg transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="text-zinc-400 hover:text-stone-100 text-sm font-semibold transition-colors px-3 py-2"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-950/20 transition-all"
              >
                Sign Up
              </a>
            </div>
          )}
        </div>
        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-stone-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-zinc-950 px-4 py-6 space-y-6">
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-2 text-base font-medium text-zinc-400">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="hover:text-stone-100 transition-colors py-2 border-b border-zinc-900/60"
            >
              Features
            </a>
            <a
              href="#games"
              onClick={() => setIsOpen(false)}
              className="hover:text-stone-100 transition-colors py-2 border-b border-zinc-900/60"
            >
              Supported Games
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="hover:text-stone-100 transition-colors py-2 border-b border-zinc-900/60"
            >
              How It Works
            </a>
          </nav>

          {/* Auth CTA Buttons */}
          {user ? (
            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900/60">
              <div className="flex flex-col bg-zinc-900/30 border border-zinc-900/80 rounded-xl p-3">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                  Logged In As
                </span>
                <span className="text-xs font-semibold tracking-wider uppercase text-stone-200 truncate">
                  {user.email}
                </span>
              </div>
              <a
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2 justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 text-sm font-semibold text-stone-200 hover:bg-zinc-800 transition-all"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
              <form action="/api/auth/sign-out" method="post" className="w-full m-0">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 justify-center rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 text-sm font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-950/10 hover:border-rose-900/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <a
                href="/login"
                className="flex w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/50 py-2.5 text-sm font-semibold text-stone-100 hover:bg-zinc-800 transition-all"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 py-2.5 text-sm font-semibold text-white hover:from-indigo-500 hover:to-indigo-400 shadow-md transition-all"
              >
                Sign Up
              </a>
            </div>
          )}

        </div>
      )}
    </header>
  );
}
