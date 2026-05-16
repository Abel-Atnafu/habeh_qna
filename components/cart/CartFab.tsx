'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/providers/CartProvider';

export default function CartFab() {
  const { count, hydrated } = useCart();
  const pathname = usePathname();

  // Hide on admin and on the cart/checkout pages themselves
  if (
    pathname?.startsWith('/admin') ||
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname?.startsWith('/order/')
  ) {
    return null;
  }

  if (!hydrated) return null;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-espresso text-cream px-5 py-3 shadow-lift hover:bg-espresso-2 transition-colors"
            aria-label={`View cart, ${count} item${count === 1 ? '' : 's'}`}
          >
            <ShoppingBag size={18} strokeWidth={2} aria-hidden="true" />
            <span className="text-sm font-medium">Cart</span>
            <span className="ml-1 inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-terracotta text-white text-xs font-bold">
              {count}
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
