import { createClient } from '@/lib/supabase/server';
import { User, Shield, Bell, KeyRound } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email || 'user@example.com';
  const userName = user?.user_metadata?.full_name || 'Builder';

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Account Settings</h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage your profile, authentication credentials, and notifications.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <User className="h-5 w-5 text-brand-400" />
          <div>
            <h2 className="text-sm font-bold text-white">Profile Information</h2>
            <p className="text-[11px] text-slate-400">Your public account identity</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={userName}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={userEmail}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <KeyRound className="h-5 w-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-white">Security &amp; Password</h2>
            <p className="text-[11px] text-slate-400">Manage password and Supabase Auth session</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Authentication is powered by Supabase Auth with secure cookie session rotation.
          You can request a password reset link to update your credentials anytime.
        </p>
      </div>
    </div>
  );
}
