'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute = pathname === '/admin/login';
  const [checking, setChecking] = useState(!isLoginRoute);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (isLoginRoute) return;

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) router.replace('/admin/login');
    }, 15000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        clearTimeout(timeout);
        if (!session) router.replace('/admin/login');
        else setChecking(false);
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(timeout);
        router.replace('/admin/login');
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginRoute]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (checking) return (
    <div className="min-h-screen bg-espresso flex items-center justify-center">
      <div className="text-cream/60 text-sm">Loading...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream-2">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
