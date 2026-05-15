'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Image,
  Calendar,
  Star,
  Sparkles,
  Megaphone,
  Settings,
  LogOut,
} from 'lucide-react';
import { Jebena } from '@/lib/icons';
import { getSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/admin/dashboard',    icon: LayoutDashboard },
  { label: 'Menu',         href: '/admin/menu',         icon: UtensilsCrossed },
  { label: 'Gallery',      href: '/admin/gallery',      icon: Image },
  { label: 'Reservations', href: '/admin/reservations', icon: Calendar },
  { label: 'Reviews',      href: '/admin/reviews',      icon: Star },
  { label: 'Specials',     href: '/admin/specials',     icon: Sparkles },
  { label: 'Events',       href: '/admin/events',       icon: Megaphone },
  { label: 'Settings',     href: '/admin/settings',     icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-espresso flex flex-col flex-shrink-0">
      {/* Top: Logo */}
      <div className="p-6 border-b border-cream/10 flex items-center gap-3">
        <Jebena size={24} color="#C9A961" />
        <span className="font-display text-lg text-cream">Yeroo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm transition-all duration-150',
                isActive
                  ? 'bg-terracotta/20 text-terracotta'
                  : 'text-cream/60 hover:bg-cream/5 hover:text-cream'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Sign out */}
      <div className="mt-auto p-4 border-t border-cream/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-cream/60 hover:text-cream transition-colors text-sm w-full py-2 px-3 rounded-xl hover:bg-cream/5"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
