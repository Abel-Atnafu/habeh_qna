'use client';

import { useEffect, useState } from 'react';
import { Jebena } from '@/lib/icons';

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      id="loader"
      className={
        hidden
          ? 'opacity-0 pointer-events-none transition-opacity duration-500'
          : 'transition-opacity duration-500'
      }
    >
      {/* Jebena icon with pulse-glow animation */}
      <Jebena
        size={80}
        color="#D4845A"
        className="animate-pulse-glow"
      />

      {/* Brand name */}
      <p
        className="font-display text-cream"
        style={{ fontSize: '12px', letterSpacing: '0.4em' }}
      >
        YEROO COFFEE
      </p>

      {/* Progress bar with terracotta shimmer */}
      <div className="loader-bar">
        <div className="loader-progress" />
      </div>
    </div>
  );
}
