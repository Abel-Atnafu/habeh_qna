'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// While payment_status is pending, ping /api/checkout/verify every 3s
// and refresh the server component so the new status renders.
export default function OrderRefresher({ txRef }: { txRef: string }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      if (cancelled) return;
      attempts += 1;
      try {
        const res = await fetch(`/api/checkout/verify?tx_ref=${encodeURIComponent(txRef)}`, {
          method: 'POST',
        });
        const body = await res.json();
        if (!cancelled && body.status && body.status !== 'pending') {
          router.refresh();
          return;
        }
      } catch {
        // ignore — try again
      }
      if (!cancelled && attempts < 40) {
        // ~2 minutes total polling
        window.setTimeout(poll, 3000);
      }
    }

    const initial = window.setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(initial);
    };
  }, [txRef, router]);

  return null;
}
