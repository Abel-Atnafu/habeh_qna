'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartLine, MenuItem } from '@/types';

const STORAGE_KEY = 'yeroo:cart:v1';

interface CartContextValue {
  lines: CartLine[];
  add: (item: MenuItem, qty?: number) => void;
  remove: (menuItemId: string) => void;
  setQty: (menuItemId: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed.filter(isValidLine));
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = (item: MenuItem, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.menu_item_id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.menu_item_id === item.id ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          qty,
          image_url: item.image_url,
        },
      ];
    });
  };

  const remove = (menuItemId: string) =>
    setLines((prev) => prev.filter((l) => l.menu_item_id !== menuItemId));

  const setQty = (menuItemId: string, qty: number) => {
    if (qty <= 0) return remove(menuItemId);
    setLines((prev) =>
      prev.map((l) => (l.menu_item_id === menuItemId ? { ...l, qty } : l)),
    );
  };

  const clear = () => setLines([]);

  const { subtotal, count } = useMemo(() => {
    let s = 0;
    let c = 0;
    for (const l of lines) {
      s += l.price * l.qty;
      c += l.qty;
    }
    return { subtotal: s, count: c };
  }, [lines]);

  return (
    <CartContext.Provider value={{ lines, add, remove, setQty, clear, subtotal, count, hydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

function isValidLine(v: unknown): v is CartLine {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.menu_item_id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.price === 'number' &&
    typeof o.qty === 'number'
  );
}
