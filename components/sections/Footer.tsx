'use client';

import { Globe, Share2, MessageCircle } from 'lucide-react';
import { Jebena } from '@/lib/icons';
import { useI18n } from '@/lib/i18n';

// ── Props ──────────────────────────────────────────────────────────────────────

interface FooterProps {
  whatsapp?: string;
}

// ── Nav links ──────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Menu', href: '#menu' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Events', href: '#events' },
  { label: 'Reservations', href: '#reservation' },
  { label: 'Contact', href: '#contact' },
] as const;

// ── Social button ──────────────────────────────────────────────────────────────

function SocialBtn({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full bg-cream/10 hover:bg-terracotta/30 flex items-center justify-center text-cream/60 hover:text-cream transition-colors duration-200"
    >
      {children}
    </a>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Footer({ whatsapp }: FooterProps) {
  const { t } = useI18n();

  const waNumber = whatsapp?.replace(/\D/g, '');
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=Hello!%20I'd%20like%20to%20make%20a%20reservation%20at%20Yeroo%20Coffee.`
    : '#';

  return (
    <footer id="footer" className="bg-espresso pt-16 pb-8">
      {/* Accent strip at the top */}
      <div className="accent-strip" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* ── Col 1: Brand ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Jebena size={32} color="#F9F5F0" />
              <span className="font-display text-cream text-lg">Yeroo Coffee</span>
            </div>
            <p className="text-cream/60 text-sm leading-relaxed mb-5">{t('footer_tagline')}</p>

            {/* Social icons */}
            <div className="flex gap-3">
              {/* Globe = Instagram stand-in (no brand icons in this lucide version) */}
              <SocialBtn href="https://instagram.com/yeroocoffee" label="Instagram">
                <Globe size={16} aria-hidden="true" />
              </SocialBtn>
              {/* Share2 = Facebook stand-in */}
              <SocialBtn href="https://facebook.com/yeroocoffee" label="Facebook">
                <Share2 size={16} aria-hidden="true" />
              </SocialBtn>
              {waNumber && (
                <SocialBtn href={waHref} label="WhatsApp">
                  <MessageCircle size={16} aria-hidden="true" />
                </SocialBtn>
              )}
            </div>
          </div>

          {/* ── Col 2: Quick links ── */}
          <nav aria-label="Footer navigation">
            <h3 className="text-cream font-semibold mb-4">{t('footer_quick_links')}</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-cream/60 hover:text-terracotta text-sm transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Col 3: Hours ── */}
          <div>
            <h3 className="text-cream font-semibold mb-4">{t('footer_hours')}</h3>
            <dl className="space-y-1.5">
              <div>
                <dt className="text-cream/60 text-sm">{t('contact_hours_mf')}</dt>
                <dd className="text-cream/60 text-sm">{t('contact_hours_mf_val')}</dd>
              </div>
              <div>
                <dt className="text-cream/60 text-sm">{t('contact_hours_sat')}</dt>
                <dd className="text-cream/60 text-sm">{t('contact_hours_sat_val')}</dd>
              </div>
              <div>
                <dt className="text-cream/60 text-sm">{t('contact_hours_sun')}</dt>
                <dd className="text-cream/60 text-sm">{t('contact_hours_sun_val')}</dd>
              </div>
            </dl>
          </div>

          {/* ── Col 4: Visit Us ── */}
          <div>
            <h3 className="text-cream font-semibold mb-4">{t('footer_visit')}</h3>
            <address className="not-italic space-y-2">
              <p className="text-cream/60 text-sm">{t('contact_address')}</p>
              <p>
                <a
                  href="tel:+251111234567"
                  className="text-cream/60 text-sm hover:text-cream transition-colors"
                >
                  +251 11 123 4567
                </a>
              </p>
              <p>
                <a
                  href="mailto:hello@yeroocoffee.et"
                  className="text-cream/60 text-sm hover:text-cream transition-colors"
                >
                  hello@yeroocoffee.et
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-cream/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-cream/40 text-xs text-center">{t('footer_copy')}</p>
          <a
            href="/admin"
            className="text-cream/[0.18] text-xs hover:text-cream/40 transition-colors duration-200"
          >
            admin
          </a>
        </div>
      </div>
    </footer>
  );
}
