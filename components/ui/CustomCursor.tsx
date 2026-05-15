'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [isHoverDevice, setIsHoverDevice] = useState(false);

  useEffect(() => {
    // Only activate on hover-capable (non-touch) devices
    if (!window.matchMedia('(hover: hover)').matches) return;

    setIsHoverDevice(true);

    let ringX = 0;
    let ringY = 0;
    let dotX = 0;
    let dotY = 0;
    let rafId: number;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    const onMouseMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;

      // Dot follows immediately
      if (dot) {
        dot.style.transform = `translate(calc(${dotX}px - 50%), calc(${dotY}px - 50%))`;
      }
    };

    // Ring lags behind via rAF lerp
    const animateRing = () => {
      ringX += (dotX - ringX) * 0.18;
      ringY += (dotY - ringY) * 0.18;

      if (ring) {
        ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
      }

      rafId = requestAnimationFrame(animateRing);
    };

    rafId = requestAnimationFrame(animateRing);

    // Hover state on interactive elements
    const onMouseEnter = () => document.body.classList.add('cursor-hover');
    const onMouseLeave = () => document.body.classList.remove('cursor-hover');

    const bindInteractiveListeners = () => {
      document.querySelectorAll<HTMLElement>('a, button, [role="button"]').forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
      });
    };

    // Initial bind + re-bind on DOM mutations for dynamically added elements
    bindInteractiveListeners();

    const observer = new MutationObserver(bindInteractiveListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.body.classList.remove('cursor-hover');
    };
  }, []);

  if (!isHoverDevice) return null;

  return (
    <>
      <div id="cursor-dot" />
      <div id="cursor-ring" />
    </>
  );
}
