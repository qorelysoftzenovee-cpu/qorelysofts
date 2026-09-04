'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      title="Sign Out"
      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-900 hover:text-red-400 transition-colors"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
