'use client';

import { Github, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '../../../components/ui/button';
import { createSupabaseBrowserClient } from '../../../lib/supabase/browser';

type Provider = 'github' | 'google';

interface LoginFormProps {
  initialMode?: 'signin' | 'signup';
}

export function LoginForm({ initialMode = 'signin' }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);

  // Email & Password credentials states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode state with prop changes (e.g. browser navigation)
  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setConfirmPassword('');
  }, [initialMode]);

  async function signIn(provider: Provider) {
    setPendingProvider(provider);
    setErrorMsg(null);
    setSuccessMsg(null);
    const supabase = createSupabaseBrowserClient();

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      options: {
        redirectTo,
      },
      provider,
    });

    if (error) {
      setPendingProvider(null);
      setErrorMsg(error.message);
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = createSupabaseBrowserClient();

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Clean session force redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
        if (error) throw error;

        if (data?.user && data.session) {
          // If auto-logged in, redirect
          window.location.href = '/dashboard';
        } else {
          setSuccessMsg('Account created successfully! Please check your email inbox to confirm your account.');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setConfirmPassword('');
    // Smoothly update browser path using Next.js official router API
    router.push(newMode === 'signin' ? '/login' : '/signup', { scroll: false });
  };

  return (
    <section className="w-full max-w-md rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md p-8 shadow-2xl relative overflow-hidden">
      {/* Subtle card glow highlight */}
      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <a href="/" className="flex items-center gap-2 group mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-950/40 group-hover:scale-105 transition-transform duration-200">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v3.75a3 3 0 0 1-3 3m-13.5 0a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-3-3" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-100 group-hover:text-white transition-colors">
            Spawn<span className="text-indigo-400">Ctl</span>
          </span>
        </a>
        <h1 className="text-2xl font-black text-stone-100 tracking-tight mt-1">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          {mode === 'signin'
            ? 'Access your cloud game server panel instantly.'
            : 'Start deploying high-performance game servers in 60s.'}
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 mb-6">
        <button
          onClick={() => handleModeChange('signin')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-md transition-all duration-200 ${mode === 'signin'
              ? 'bg-zinc-800 text-stone-50 shadow-md'
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          Sign In
        </button>
        <button
          onClick={() => handleModeChange('signup')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-md transition-all duration-200 ${mode === 'signup'
              ? 'bg-zinc-800 text-stone-50 shadow-md'
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          Create Account
        </button>
      </div>

      {/* Email & Password Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4 mb-5">
        <div>
          <label htmlFor="email" className="block text-2xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors shadow-inner disabled:opacity-50"
            disabled={pendingProvider !== null || isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-2xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors shadow-inner disabled:opacity-50"
            disabled={pendingProvider !== null || isSubmitting}
          />
        </div>


        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-2xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 text-stone-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors shadow-inner disabled:opacity-50"
              disabled={pendingProvider !== null || isSubmitting}
            />
          </div>
        )}


        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 p-3.5 text-xs text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 p-3.5 text-xs text-emerald-400">
            <svg className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        <Button
          disabled={pendingProvider !== null || isSubmitting}
          type="submit"
          className="w-full justify-center h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-extrabold rounded-xl text-sm transition-all hover:scale-[1.01] shadow-lg shadow-indigo-950/20 flex items-center"
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : mode === 'signin' ? (
            'Sign In with Email'
          ) : (
            'Create Account with Email'
          )}
        </Button>
      </form>

      {/* Or Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-800/80" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-zinc-950 px-2 text-zinc-500 font-bold tracking-wider rounded-md border border-zinc-900">
            Or continue with
          </span>
        </div>
      </div>

      {/* OAuth Button Stack */}
      <div className="grid gap-3.5">
        <Button
          disabled={pendingProvider !== null || isSubmitting}
          onClick={() => signIn('github')}
          type="button"
          className="w-full justify-center gap-2.5 h-12 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-stone-200 transition-all font-semibold rounded-xl text-sm"
        >
          {pendingProvider === 'github' ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <Github className="h-5 w-5 text-stone-100" />
          )}
          <span>Continue with GitHub</span>
        </Button>

        <Button
          disabled={pendingProvider !== null || isSubmitting}
          onClick={() => signIn('google')}
          type="button"
          className="w-full justify-center gap-2.5 h-12 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-stone-200 transition-all font-semibold rounded-xl text-sm"
        >
          {pendingProvider === 'google' ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.875 5.875 0 0 1 8.1 12.67a5.875 5.875 0 0 1 5.89-5.865c1.62 0 3.097.65 4.194 1.716l3.14-3.14a9.92 9.92 0 0 0-7.334-3.072C8.5 2.309 4 6.81 4 12.39c0 5.58 4.5 10.081 9.99 10.081 5.753 0 9.61-4.04 9.61-9.782 0-.67-.06-1.314-.176-1.936l-11.184-.068z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </Button>
      </div>

      <div className="mt-8 text-center text-xs text-zinc-500 leading-relaxed">
        By continuing, you agree to SpawnCtl's terms of service and dynamic resource usage agreements.
      </div>
    </section>
  );
}
