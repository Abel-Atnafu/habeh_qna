'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Share2, MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

// ── Props ──────────────────────────────────────────────────────────────────────

interface ContactProps {
  whatsapp?: string;
}

// ── Hours data ─────────────────────────────────────────────────────────────────

const HOURS = [
  { labelKey: 'contact_hours_mf', valueKey: 'contact_hours_mf_val' },
  { labelKey: 'contact_hours_sat', valueKey: 'contact_hours_sat_val' },
  { labelKey: 'contact_hours_sun', valueKey: 'contact_hours_sun_val' },
] as const;

// ── Social button ──────────────────────────────────────────────────────────────

function SocialButton({
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
      className="w-10 h-10 rounded-full bg-cream/10 hover:bg-terracotta/30 flex items-center justify-center text-cream/70 hover:text-cream transition-colors duration-200"
    >
      {children}
    </a>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Contact({ whatsapp }: ContactProps) {
  const { t } = useI18n();

  const waNumber = whatsapp?.replace(/\D/g, '');
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=Hello!%20I'd%20like%20to%20make%20a%20reservation%20at%20Yeroo%20Coffee.`
    : '#';

  return (
    <section id="contact" className="py-20 md:py-28 bg-espresso">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">

          {/* ── Left: Map embed ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] }}
            className="w-full"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.7469!3d9.0180!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1"
              className="w-full h-72 md:h-[420px] rounded-2xl border-0"
              style={{ filter: 'sepia(0.3) saturate(0.8) hue-rotate(-10deg)' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Yeroo Coffee location — Addisu Gebeya, Addis Ababa"
            />
          </motion.div>

          {/* ── Right: Info panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] as [number,number,number,number], delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <p className="eyebrow mb-3">{t('contact_label')}</p>
            <h2 className="font-display text-4xl text-cream mb-6">{t('contact_title')}</h2>

            {/* Contact details */}
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-terracotta shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-cream/70 text-sm">{t('contact_address')}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-terracotta shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href="tel:+251111234567"
                  className="text-cream/70 text-sm hover:text-cream transition-colors"
                >
                  +251 11 123 4567
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-terracotta shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href="mailto:hello@yeroocoffee.et"
                  className="text-cream/70 text-sm hover:text-cream transition-colors"
                >
                  hello@yeroocoffee.et
                </a>
              </li>
            </ul>

            {/* Hours table */}
            <div className="mt-6">
              <h3 className="text-cream font-semibold mb-3">{t('contact_hours_title')}</h3>
              <dl>
                {HOURS.map(({ labelKey, valueKey }) => (
                  <div
                    key={labelKey}
                    className="flex justify-between border-b border-cream/10 py-2"
                  >
                    <dt className="text-cream/70 text-sm">{t(labelKey)}</dt>
                    <dd className="text-cream/70 text-sm font-medium">{t(valueKey)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Social links */}
            <div className="flex gap-4 mt-6">
              {/* Instagram — represented via Globe (no brand icons in this lucide version) */}
              <SocialButton href="https://instagram.com/yeroocoffee" label="Follow us on Instagram">
                <Globe size={18} aria-hidden="true" />
              </SocialButton>
              {/* Facebook — represented via Share2 */}
              <SocialButton href="https://facebook.com/yeroocoffee" label="Follow us on Facebook">
                <Share2 size={18} aria-hidden="true" />
              </SocialButton>
              {waNumber && (
                <SocialButton href={waHref} label="Message us on WhatsApp">
                  <MessageCircle size={18} aria-hidden="true" />
                </SocialButton>
              )}
              {/* TikTok represented via MessageCircle (lucide has no TikTok icon) */}
              <SocialButton href="https://tiktok.com/@yeroocoffee" label="Follow us on TikTok">
                <MessageCircle size={18} aria-hidden="true" />
              </SocialButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
