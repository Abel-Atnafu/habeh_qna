import { createClient } from '@/lib/supabase/server';
import { Settings, DailySpecial, Event, MenuItem, GalleryItem } from '@/types';
import Announcement from '@/components/sections/Announcement';
import Navbar from '@/components/sections/Navbar';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import About from '@/components/sections/About';
import DailySpecials from '@/components/sections/DailySpecials';
import MenuSection from '@/components/sections/MenuSection';
import EventsSection from '@/components/sections/EventsSection';
import Reservation from '@/components/sections/Reservation';
import Gallery from '@/components/sections/Gallery';
import Testimonials from '@/components/sections/Testimonials';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import FloatingFab from '@/components/sections/FloatingFab';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CustomCursor from '@/components/ui/CustomCursor';

export default async function HomePage() {
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];

  const [
    { data: settingsRow },
    { data: specialsRows },
    { data: eventsRows },
    { data: menuRows },
    { data: galleryRows },
  ] = await Promise.all([
    supabase.from('settings').select('*').single(),
    supabase.from('daily_specials').select('*').eq('active', true).eq('valid_date', today),
    supabase
      .from('events')
      .select('*')
      .eq('active', true)
      .gte('date', today)
      .order('date', { ascending: true }),
    supabase.from('menu_items').select('*').order('sort_order', { ascending: true }),
    supabase.from('gallery').select('*').order('sort_order', { ascending: true }),
  ]);

  const settings = settingsRow as Settings | null;
  const specials = (specialsRows ?? []) as DailySpecial[];
  const events = (eventsRows ?? []) as Event[];
  const menuItems = (menuRows ?? []) as MenuItem[];
  const gallery = (galleryRows ?? []) as GalleryItem[];

  const whatsapp = settings?.whatsapp ?? '';

  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      {settings?.announcement_active && (
        <Announcement
          text={settings.announcement_text ?? ''}
          active={settings.announcement_active}
        />
      )}
      <Navbar whatsapp={whatsapp} />
      <main>
        <Hero />
        <Stats />
        <About />
        {specials.length > 0 && <DailySpecials initialSpecials={specials} />}
        <MenuSection initialMenuItems={menuItems} />
        {events.length > 0 && <EventsSection initialEvents={events} />}
        <Reservation whatsapp={whatsapp} />
        <Gallery initialGallery={gallery} />
        <Testimonials />
        <Contact whatsapp={whatsapp} />
      </main>
      <Footer whatsapp={whatsapp} />
      <FloatingFab whatsapp={whatsapp} />
    </>
  );
}
