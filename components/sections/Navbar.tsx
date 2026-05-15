'use client';

import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Jebena } from '@/lib/icons';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavLink {
  labelKey: TranslationKey;
  href: string;
}

interface NavbarProps {
  whatsapp?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { labelKey: 'nav_home',         href: '#home' },
  { labelKey: 'nav_about',        href: '#about' },
  { labelKey: 'nav_menu',         href: '#menu' },
  { labelKey: 'nav_gallery',      href: '#gallery' },
  { labelKey: 'nav_events',       href: '#events' },
  { labelKey: 'nav_reservations', href: '#reservation' },
  { labelKey: 'nav_contact',      href: '#contact' },
];

// Framer Motion variants for the mobile drawer link stagger
const drawerLinkVariants = {
  hidden:  { opacity: 0, x: 24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.05 + i * 0.06,
      type: 'spring' as const,
      stiffness: 300,
      damping: 28,
    },
  }),
};

// ── Component ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Navbar({ whatsapp }: NavbarProps) {
  const { t, lang, setLang } = useI18n();
  const [scrolled,    setScrolled]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  // ── Scroll listener ──────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Evaluate on mount so initial state is correct without scrolling
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // ── Body scroll lock while drawer is open ────────────────────────────────
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const closeDrawer = () => setDrawerOpen(false);
  const toggleLang  = () => setLang(lang === 'en' ? 'am' : 'en');

  // ── Dynamic colour tokens (derived from scroll state) ────────────────────
  const logoIconColor  = scrolled ? '#5C3D2E' : '#D4845A';
  const logoTextClass  = scrolled ? 'text-espresso' : 'text-cream';
  const navLinkClass   = scrolled
    ? 'text-espresso/80 hover:text-espresso'
    : 'text-cream/80 hover:text-cream';
  const langBtnClass   = scrolled
    ? 'text-espresso/70 border-espresso/20 hover:border-espresso/50 hover:text-espresso'
    : 'text-cream/70 border-cream/20 hover:border-cream/50 hover:text-cream';
  const hamburgerClass = scrolled ? 'text-espresso' : 'text-cream';

  return (
    <>
      {/* ══════════════════════════════════════
          Navbar bar
      ══════════════════════════════════════ */}
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-cream/95 backdrop-blur-md shadow-[0_1px_16px_rgba(26,15,8,.08)]'
            : 'bg-transparent',
        ].join(' ')}
        style={{ height: '72px' }}
      >
        <div className="flex items-center justify-between h-full px-6 md:px-12 max-w-screen-xl mx-auto">

          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2 shrink-0 rounded-md
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
            aria-label="Yeroo Coffee — home"
          >
            <Jebena size={28} color={logoIconColor} aria-hidden="true" />
            <span
              className={`font-display text-xl font-bold tracking-tight transition-colors duration-300 ${logoTextClass}`}
            >
              Yeroo
            </span>
          </a>

          {/* Desktop nav — hidden below lg (1024px) */}
          <nav
            className="hidden lg:flex items-center gap-6 xl:gap-8"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ labelKey, href }) => (
              <a
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors duration-200
                            focus:outline-none focus-visible:underline ${navLinkClass}`}
              >
                {t(labelKey)}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">

            {/* Language toggle */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={lang === 'en' ? 'Switch to Amharic' : 'Switch to English'}
              className={[
                'hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full border',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50',
                langBtnClass,
              ].join(' ')}
            >
              {lang === 'en' ? 'EN | አማ' : 'አማ | EN'}
            </button>

            {/* Mobile hamburger — shown below lg */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className={[
                'lg:hidden flex items-center justify-center w-9 h-9 rounded-md',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50',
                hamburgerClass,
              ].join(' ')}
            >
              <Menu size={22} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          Mobile drawer (right-side slide-in)
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
              onClick={closeDrawer}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer-panel"
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
              className="fixed right-0 top-0 h-full w-[280px] bg-espresso z-[70] lg:hidden
                         flex flex-col shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-cream/10">
                <div className="flex items-center gap-2">
                  <Jebena size={24} color="#D4845A" aria-hidden="true" />
                  <span className="font-display text-lg text-cream font-bold">Yeroo</span>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close navigation menu"
                  className="flex items-center justify-center w-8 h-8 rounded-md
                             text-cream/60 hover:text-cream hover:bg-cream/10
                             transition-colors duration-200
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
                >
                  <X size={18} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>

              {/* Drawer links */}
              <nav
                className="flex flex-col gap-1 px-4 py-6 flex-1 overflow-y-auto"
                aria-label="Mobile navigation"
              >
                {NAV_LINKS.map(({ labelKey, href }, i) => (
                  <motion.a
                    key={href}
                    href={href}
                    onClick={closeDrawer}
                    custom={i}
                    variants={drawerLinkVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center px-4 py-3 rounded-lg
                               text-cream/80 hover:text-cream hover:bg-cream/10
                               text-base font-medium transition-colors duration-200
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
                  >
                    {t(labelKey)}
                  </motion.a>
                ))}
              </nav>

              {/* Language toggle pinned to drawer bottom */}
              <div className="px-6 py-5 border-t border-cream/10">
                <button
                  type="button"
                  onClick={toggleLang}
                  className="w-full text-xs font-medium px-3 py-2 rounded-full border
                             border-cream/20 text-cream/70
                             hover:border-cream/50 hover:text-cream
                             transition-all duration-200
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
                >
                  {lang === 'en' ? 'Switch to አማርኛ' : 'Switch to English'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
