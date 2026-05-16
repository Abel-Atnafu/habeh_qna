'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Coffee } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

// Cafe-themed ambient loop, distinct from the hero so each clip earns its place.
// Pexels #4926200 "Person Operate an Espresso Machine" by Tima Miroshnichenko (CC0).
const VIDEO_SOURCES = [
  { src: 'https://videos.pexels.com/video-files/4926200/4926200-hd_1920_1080_25fps.mp4', type: 'video/mp4' },
  { src: 'https://videos.pexels.com/video-files/4926200/4926200-uhd_2560_1440_25fps.mp4', type: 'video/mp4' },
];
// Barista pulling a shot — same mood as the video, used as poster + graceful fallback.
const POSTER =
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=2400&q=80';

export default function StoryVideo() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [videoFailed, setVideoFailed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Skip the video on small viewports to save mobile data
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Pause when off-screen — saves CPU and battery
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView]);

  const showVideo = !reducedMotion && !isMobile && !videoFailed;

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative w-full overflow-hidden bg-espresso"
      aria-label="Yeroo Coffee — our story"
    >
      <div className="relative h-[60vh] min-h-[420px] max-h-[720px] w-full">
        {/* Poster: always loaded, gently zooms when video is absent */}
        <div
          className={`absolute inset-0 bg-cover bg-center ${showVideo ? '' : 'animate-hero-zoom'}`}
          style={{ backgroundImage: `url(${POSTER})` }}
          aria-hidden="true"
        />
        {showVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster={POSTER}
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
          >
            {VIDEO_SOURCES.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        )}

        {/* Legibility overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/55 to-espresso/30" aria-hidden="true" />
        <div className="grain absolute inset-0" aria-hidden="true" />

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 h-full flex items-center"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
            <div className="max-w-xl text-cream">
              <span className="inline-flex items-center gap-2 bg-terracotta/20 border border-terracotta/30 text-terracotta text-[11px] tracking-widest uppercase rounded-full px-3 py-1 mb-5">
                <Coffee size={12} aria-hidden="true" />
                {t('story_badge')}
              </span>
              <h2
                className="font-display leading-[1.05] mb-5 drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)]"
                style={{ fontSize: 'clamp(36px, 5.5vw, 64px)' }}
              >
                {t('story_title_1')}{' '}
                <span className="italic text-terracotta">{t('story_title_2')}</span>
              </h2>
              <p className="text-cream/85 text-base md:text-lg font-light">
                {t('story_body')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
