'use client';

import { useEffect, useRef } from 'react';

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger index — each unit adds 0.1 s of transition-delay */
  delay?: number;
}

export default function SectionReveal({
  children,
  className = '',
  delay = 0,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          // Once revealed, stop observing
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -48px 0px',
      },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay * 0.1}s` }}
    >
      {children}
    </div>
  );
}
