'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // If email confirmation is disabled, user session is created immediately
      if (data?.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
        <div className="w-full max-w-md text-center rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-bold">Check your email</h2>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            We sent a verification confirmation link to <strong className="text-white">{email}</strong>.
            Click the link to verify your account and sign in.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500"
            >
              Go to Sign In <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">Create your account</h2>
          <p className="mt-2 text-xs text-slate-400">
            Get started with your free 14-day trial
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Sarah Connor"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@startup.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-brand-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
