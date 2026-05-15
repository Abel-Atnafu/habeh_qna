'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ArrowUp } from 'lucide-react';

// ── Props ──────────────────────────────────────────────────────────────────────

interface FloatingFabProps {
  whatsapp?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function FloatingFab({ whatsapp }: FloatingFabProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Watch scroll position
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    // Passive listener for performance
    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on mount to sync with current scroll position
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const waNumber = whatsapp?.replace(/\D/g, '');
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=Hello!%20I'd%20like%20to%20make%20a%20reservation%20at%20Yeroo%20Coffee.`
    : `https://wa.me/?text=Hello!%20I'd%20like%20to%20make%20a%20reservation%20at%20Yeroo%20Coffee.`;

  return (
    <div className="fab-container" aria-label="Floating action buttons">
      {/* ── Scroll-to-top button ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-[84px] right-6 z-50 w-11 h-11 rounded-full bg-espresso border border-cream/20 text-cream flex items-center justify-center shadow-lift hover:bg-espresso-2 hover:border-cream/40 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
          >
            <ArrowUp size={18} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── WhatsApp FAB ── */}
      <motion.a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-whatsapp flex items-center justify-center shadow-lift lift focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/60 focus-visible:ring-offset-2"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={26} color="white" aria-hidden="true" />
      </motion.a>
    </div>
  );
}
