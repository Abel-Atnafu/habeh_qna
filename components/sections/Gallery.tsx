'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { useI18n } from '@/lib/i18n';
import { useGallery } from '@/lib/queries';
import type { GalleryItem } from '@/types';

// ── Props ──────────────────────────────────────────────────────────────────────

interface GalleryProps {
  initialGallery?: GalleryItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getUrl(item: GalleryItem): string {
  return item.image_url || item.url;
}

// ── Animation ─────────────────────────────────────────────────────────────────

const itemVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.06,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  }),
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function Gallery({ initialGallery }: GalleryProps) {
  const { t } = useI18n();
  const { data: galleryData = [] } = useGallery();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Prefer live data; fall back to SSR initial data
  const items = galleryData.length > 0 ? galleryData : (initialGallery ?? []);

  const slides = items.map((item) => ({
    src: getUrl(item),
    description: item.caption ?? undefined,
  }));

  const handleOpen = (index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section id="gallery" className="py-24 bg-beige">
      <div className="max-w-6xl mx-auto px-6">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">{t('gallery_label')}</p>
          <h2 className="font-display text-4xl text-espresso relative inline-block">
            {t('gallery_title')}
            {/* Thick gold underline */}
            <span
              className="block h-1 w-24 bg-gold mx-auto mt-3 rounded-full"
              aria-hidden="true"
            />
          </h2>
        </div>

        {/* ── Masonry grid ── */}
        {items.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="mb-4 break-inside-avoid rounded-2xl overflow-hidden relative group cursor-pointer"
                onClick={() => handleOpen(index)}
                role="button"
                tabIndex={0}
                aria-label={
                  item.caption
                    ? `View photo: ${item.caption}`
                    : `View gallery image ${index + 1}`
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpen(index);
                  }
                }}
              >
                <img
                  src={getUrl(item)}
                  alt={item.caption ?? ''}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hover overlay with caption */}
                <div className="absolute inset-0 bg-espresso/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  {item.caption && (
                    <p className="p-4 text-cream text-sm font-medium">{item.caption}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-espresso/40">
            <p className="font-display text-xl">Gallery coming soon.</p>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={photoIndex}
        on={{ view: ({ index }) => setPhotoIndex(index) }}
        styles={{
          container: { backgroundColor: 'rgba(26,15,8,0.97)' },
        }}
      />
    </section>
  );
}
