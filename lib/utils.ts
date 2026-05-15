import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `Br ${price.toLocaleString('en-ET')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getImageUrl(item: { url?: string; image_url?: string | null }): string {
  return item.image_url || item.url || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80';
}
