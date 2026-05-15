'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Printer, Leaf } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useMenuItems } from '@/lib/queries';
import { formatPrice, cn } from '@/lib/utils';
import { MENU_CATEGORIES } from '@/types';
import type { MenuItem } from '@/types';
import { Jebena } from '@/lib/icons';
import SkeletonCard from '@/components/ui/SkeletonCard';

interface MenuSectionProps {
  initialMenuItems?: MenuItem[];
}

function MenuItemCard({ item }: { item: MenuItem }) {
  const { t } = useI18n();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'menu-card bg-white rounded-card shadow-card lift',
        'border-l-[3px] border-terracotta hover:border-gold',
        'transition-all duration-200 overflow-hidden relative',
        !item.available && 'opacity-60'
      )}
    >
      {/* Image area */}
      <div className="relative h-40 bg-cream-2 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20" aria-hidden="true">
              🍽️
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-espresso leading-snug">
            {item.name}
          </h3>
          <span className="badge badge-price shrink-0 text-xs">
            {formatPrice(item.price)}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-espresso/60 leading-relaxed mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Dietary badges */}
        {(item.is_fasting || item.is_veg || item.is_spicy) && (
          <div className="flex gap-1 flex-wrap mt-2">
            {item.is_fasting && (
              <span className="badge badge-fasting">
                {t('menu_badge_fasting')}
              </span>
            )}
            {item.is_veg && (
              <span className="badge badge-veg">
                🌱 {t('menu_badge_veg')}
              </span>
            )}
            {item.is_spicy && (
              <span className="badge badge-spicy">
                🌶️ {t('menu_badge_spicy')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Unavailable overlay */}
      {!item.available && (
        <div className="absolute inset-0 flex items-center justify-center bg-espresso/30 backdrop-blur-[2px] rounded-card">
          <span className="bg-espresso/80 text-cream text-xs font-medium px-3 py-1.5 rounded-full">
            {t('menu_unavailable')}
          </span>
        </div>
      )}
    </motion.article>
  );
}

export default function MenuSection({ initialMenuItems }: MenuSectionProps) {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [fastingOnly, setFastingOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  // Fetch ALL items once; filter client-side for instant response
  const { data: allItems = [], isLoading } = useMenuItems({
    initialData: initialMenuItems,
  });

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (fastingOnly && !item.is_fasting) return false;
      if (vegOnly && !item.is_veg) return false;
      return true;
    });
  }, [allItems, activeCategory, fastingOnly, vegOnly]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="relative py-24 bg-cream-2"
    >
      {/* Giant Jebena watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <Jebena size={400} color="currentColor" className="text-espresso opacity-[0.04]" />
      </div>

      <div className="relative">
        {/* ── Section header ───────────────────────────────────────── */}
        <div className="text-center mb-10 px-6">
          <motion.p
            className="eyebrow tracking-widest text-terracotta mb-3"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            {t('menu_label')}
          </motion.p>
          <motion.h2
            className="font-display text-4xl md:text-5xl text-espresso"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
          >
            {t('menu_title')}
          </motion.h2>
        </div>

        {/* ── Sticky filter bar ────────────────────────────────────── */}
        <div className="filter-bar sticky top-[72px] z-40 bg-cream-2/90 backdrop-blur-md py-4 mb-8 border-b border-espresso/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
              {/* Category pills — horizontal scroll on small screens */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
                {MENU_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                      activeCategory === cat
                        ? 'bg-terracotta text-white shadow-md'
                        : 'bg-cream text-espresso/70 hover:bg-terracotta/10 hover:text-espresso'
                    )}
                  >
                    {cat === 'All' ? t('menu_all') : cat}
                  </button>
                ))}
              </div>

              {/* Filter toggles */}
              <div className="flex gap-2 shrink-0 items-center">
                {/* Fasting toggle */}
                <button
                  type="button"
                  onClick={() => setFastingOnly((v) => !v)}
                  aria-pressed={fastingOnly}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200',
                    fastingOnly
                      ? 'bg-forest text-white shadow'
                      : 'bg-forest/10 text-forest hover:bg-forest/20'
                  )}
                >
                  <Leaf size={12} strokeWidth={2.5} />
                  {t('menu_fasting_toggle')}
                </button>

                {/* Veg toggle */}
                <button
                  type="button"
                  onClick={() => setVegOnly((v) => !v)}
                  aria-pressed={vegOnly}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200',
                    vegOnly
                      ? 'bg-green-700 text-white shadow'
                      : 'bg-green-700/10 text-green-700 hover:bg-green-700/20'
                  )}
                >
                  🌱 {t('menu_veg_toggle')}
                </button>

                {/* Print button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className={cn(
                    'btn flex items-center gap-2 text-xs rounded-full',
                    'text-coffee border border-coffee/30 bg-transparent',
                    'hover:bg-coffee/5 hover:border-coffee/60',
                    'px-3 py-2'
                  )}
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <Printer size={14} strokeWidth={1.8} />
                  {t('menu_print')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Menu grid ────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6">
          {isLoading ? (
            <div className="menu-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-6xl mb-4" aria-hidden="true">
                🔍
              </span>
              <p className="text-espresso/50 text-sm">
                No items match your current filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setFastingOnly(false);
                  setVegOnly(false);
                }}
                className="mt-4 text-terracotta text-sm font-medium underline underline-offset-2 hover:text-terracotta-dark transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="menu-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* VAT note */}
          {!isLoading && filteredItems.length > 0 && (
            <p className="text-center text-xs text-espresso/40 mt-8">
              {t('menu_vat_note')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
