'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-black text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
              <Zap className="h-5 w-5" />
            </div>
            <span>SaaS<span className="text-brand-500">Lite</span></span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-2 text-xs text-slate-400">
            Sign in to access your protected dashboard
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-brand-400 hover:text-brand-300">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-bold text-brand-400 hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
