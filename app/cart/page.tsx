'use client';

import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Coffee } from 'lucide-react';
import { useCart } from '@/providers/CartProvider';
import { useI18n } from '@/lib/i18n';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { lines, setQty, remove, subtotal, count, hydrated } = useCart();
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-cream-2 pt-10 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/#menu"
          className="inline-flex items-center gap-2 text-sm text-espresso/60 hover:text-espresso transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          {t('cart_continue_shopping')}
        </Link>

        <h1 className="font-display text-3xl md:text-4xl text-espresso mb-8 flex items-center gap-3">
          <ShoppingBag size={28} className="text-terracotta" />
          {t('cart_title')}
        </h1>

        {!hydrated ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : count === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <Coffee size={48} className="text-terracotta/30 mx-auto mb-4" />
            <p className="text-espresso/60 mb-6">{t('cart_empty')}</p>
            <Link href="/#menu" className="btn btn-primary text-sm">
              {t('cart_empty_cta')}
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-8">
              {lines.map((line) => (
                <li
                  key={line.menu_item_id}
                  className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-xl bg-cream-2 overflow-hidden shrink-0 flex items-center justify-center">
                    {line.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.image_url}
                        alt={line.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Coffee size={28} className="text-terracotta/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-espresso truncate">{line.name}</p>
                    <p className="text-sm text-terracotta font-semibold mt-0.5">
                      {formatPrice(line.price * line.qty)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(line.menu_item_id, line.qty - 1)}
                      className="w-8 h-8 rounded-full border border-espresso/15 text-espresso/70 hover:bg-cream-2 flex items-center justify-center transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-medium text-sm tabular-nums w-6 text-center">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.menu_item_id, line.qty + 1)}
                      className="w-8 h-8 rounded-full border border-espresso/15 text-espresso/70 hover:bg-cream-2 flex items-center justify-center transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(line.menu_item_id)}
                    className="text-espresso/30 hover:text-red-500 transition-colors p-2"
                    aria-label={t('cart_remove')}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-espresso/60 text-sm">{t('cart_subtotal')}</span>
                <span className="font-medium text-espresso">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-espresso/5">
                <span className="font-semibold text-espresso">{t('cart_total')}</span>
                <span className="font-display text-2xl text-terracotta font-bold">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="btn btn-primary w-full justify-center mt-6"
              >
                {t('cart_continue')}
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
