'use client';

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/providers/CartProvider';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/types';

interface AddToCartButtonProps {
  item: MenuItem;
  className?: string;
}

export default function AddToCartButton({ item, className }: AddToCartButtonProps) {
  const { add } = useCart();
  const { t } = useI18n();
  const [justAdded, setJustAdded] = useState(false);

  if (!item.available) return null;

  const handleAdd = () => {
    add(item, 1);
    toast.success(t('cart_added'));
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={`${t('cart_add')} — ${item.name}`}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
        'transition-all duration-200',
        justAdded
          ? 'bg-green-600 text-white'
          : 'bg-terracotta text-white hover:bg-terracotta-dark active:scale-95',
        className,
      )}
    >
      {justAdded ? <Check size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
      {justAdded ? t('cart_added_short') : t('cart_add')}
    </button>
  );
}
