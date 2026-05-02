'use client';

/**
 * /login/-route — eksisterer kun for bagudkompatibilitet med tidligere links.
 * Login-UX'en er nu en overlay på dashboardet (se <AuthGate> i lib/auth.tsx),
 * så vi redirecter til / hvor overlay'en automatisk dukker op hvis ikke logget ind.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <main className="min-h-[100dvh] bg-slate-50/40 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Indlæser" />
    </main>
  );
}
