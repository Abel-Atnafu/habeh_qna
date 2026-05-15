'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnnouncementProps {
  text: string;
  active: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'yeroo:announcement-dismissed';

// ── Component ─────────────────────────────────────────────────────────────────

export default function Announcement({ text, active }: AnnouncementProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read sessionStorage only on the client to avoid SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  // Don't render on server (avoids flash), and bail early if inactive/dismissed
  if (!mounted) return null;
  if (!active || dismissed) return null;

  return (
    <div
      id="announcement"
      role="banner"
      aria-live="polite"
      className="relative bg-espresso text-terracotta text-xs py-2 px-4 text-center"
    >
      <span className="inline-block max-w-[calc(100%-3rem)] leading-relaxed">
        {text}
      </span>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className={[
          'absolute right-3 top-1/2 -translate-y-1/2',
          'flex items-center justify-center w-6 h-6 rounded-full',
          'text-terracotta hover:text-cream hover:bg-terracotta/20',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60',
        ].join(' ')}
      >
        <X size={12} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
}
