'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: {
    nav_home: 'Home',
    nav_about: 'About',
    nav_menu: 'Menu',
    nav_gallery: 'Gallery',
    nav_events: 'Events',
    nav_reservations: 'Reservations',
    nav_contact: 'Contact',
    hero_badge: 'Est. Addisu Gebeya, Ethiopia',
    hero_title_1: 'Yeroo',
    hero_title_2: 'Coffee',
    hero_sub: 'From the Birthplace of Coffee — Addis Ababa, Ethiopia',
    hero_cta_menu: 'Explore Menu',
    hero_cta_reserve: 'Reserve a Table',
    stats_guests: 'Daily Guests',
    stats_items: 'Menu Items',
    stats_years: 'Years Experience',
    stats_beans: 'Ethiopian Beans',
    about_label: 'OUR STORY',
    about_title: 'A Taste of Ethiopia, In Every Cup',
    about_body_1: 'Born in the heart of Addisu Gebeya, Yeroo Coffee is more than a café — it\'s a living tribute to Ethiopia\'s ancient coffee traditions. We source our beans from the highlands of Yirgacheffe, Sidama, and Harrar, roasting them in-house to bring you the purest expression of Ethiopian terroir.',
    about_body_2: 'Our kitchen celebrates the full spectrum of Ethiopian cuisine — from slow-braised Doro Wat to our beloved wood-fired pizza — crafted with the care of generations.',
    about_proverb: '"Bunna dabo naw"',
    about_proverb_tr: 'Coffee is our bread — Ethiopian proverb',
    about_f1_title: 'Ethiopian Breakfast',
    about_f1_desc: 'Traditional fir-fir, chechebsa & fresh ambasha bread served with spiced tea',
    about_f2_title: 'Wood-fired Kitchen',
    about_f2_desc: 'Our pizzas and injera are made fresh daily in our traditional clay oven',
    about_f3_title: 'Italian–Ethiopian Fusion',
    about_f3_desc: 'House-made pasta and authentic Italian recipes with an Ethiopian twist',
    about_f4_title: 'Fresh Coffee Ceremony',
    about_f4_desc: 'Experience the full jebena ceremony — three rounds of freshly roasted coffee',
    about_f5_title: 'Fasting Menu — ፆም',
    about_f5_desc: 'A dedicated Orthodox fasting menu with over 15 vegan-friendly dishes',
    specials_label: 'TODAY\'S SPECIALS',
    specials_title: "Chef's Daily Picks",
    menu_label: 'THE MENU',
    menu_title: 'Our Offerings',
    menu_all: 'All',
    menu_fasting_toggle: 'ፆም Fasting Only',
    menu_veg_toggle: 'Vegetarian Only',
    menu_unavailable: 'Currently Unavailable',
    menu_vat_note: 'All prices include 15% VAT & 3% service charge',
    menu_print: 'Print Menu',
    menu_badge_fasting: 'ፆም Fasting',
    menu_badge_veg: 'Vegetarian',
    menu_badge_spicy: 'Spicy',
    events_label: 'EVENTS',
    events_title: 'Upcoming at Yeroo',
    events_learn_more: 'Learn More',
    reservation_label: 'RESERVATIONS',
    reservation_title: 'Reserve Your Table',
    reservation_sub: 'Join us for an unforgettable dining experience',
    form_name: 'Full Name',
    form_phone: 'Phone Number',
    form_date: 'Date',
    form_time: 'Time',
    form_guests: 'Number of Guests',
    form_special: 'Special Requests',
    form_submit: 'Confirm Reservation',
    form_whatsapp: 'Or message us on WhatsApp',
    form_success_title: 'Reservation Confirmed!',
    form_success_sub: "We'll see you soon. Check your WhatsApp for confirmation.",
    gallery_label: 'GALLERY',
    gallery_title: 'A Feast for the Eyes',
    testimonials_label: 'TESTIMONIALS',
    testimonials_title: 'What Our Guests Say',
    review_name: 'Your Name',
    review_message: 'Your Review',
    review_submit: 'Submit Review',
    review_pending: 'Your review will appear after admin approval.',
    contact_label: 'FIND US',
    contact_title: 'Visit Yeroo Coffee',
    contact_address: 'Addisu Gebeya, Addis Ababa, Ethiopia',
    contact_hours_title: 'Opening Hours',
    contact_hours_mf: 'Mon – Fri',
    contact_hours_sat: 'Saturday',
    contact_hours_sun: 'Sunday',
    contact_hours_mf_val: '7:00 AM – 10:00 PM',
    contact_hours_sat_val: '7:00 AM – 11:00 PM',
    contact_hours_sun_val: '8:00 AM – 10:00 PM',
    footer_tagline: 'From the birthplace of coffee to your table.',
    footer_quick_links: 'Quick Links',
    footer_hours: 'Hours',
    footer_visit: 'Visit Us',
    footer_copy: '© 2025 Yeroo Coffee. Addisu Gebeya, Addis Ababa.',
    scroll_top: 'Back to top',
    loading: 'Loading...',
  },
  am: {
    nav_home: 'መነሻ',
    nav_about: 'ስለ እኛ',
    nav_menu: 'ምግብ ዝርዝር',
    nav_gallery: 'ፎቶዎች',
    nav_events: 'ዝግጅቶች',
    nav_reservations: 'ቦታ ምዝገባ',
    nav_contact: 'አድራሻ',
    hero_badge: 'ከ አዲስ ገበያ፣ ኢትዮጵያ',
    hero_title_1: 'የሮ',
    hero_title_2: 'ቡና',
    hero_sub: 'ከቡናው ትውልድ አገር — አዲስ አበባ፣ ኢትዮጵያ',
    hero_cta_menu: 'ምናሌ ይመልከቱ',
    hero_cta_reserve: 'ቦታ ይያዙ',
    stats_guests: 'ዕለታዊ እንግዶች',
    stats_items: 'የምናሌ ዓይነቶች',
    stats_years: 'ዓመታት ልምድ',
    stats_beans: 'ኢትዮጵያዊ ቡና',
    about_label: 'ታሪካችን',
    about_title: 'የኢትዮጵያ ጣዕም፣ በእያንዳንዱ ጽዋ',
    about_body_1: 'ከአዲስ ገበያ ልብ የተወለደው የሮ ቡና ከካፌ በላይ ነው — የኢትዮጵያን ጥንታዊ የቡና ወጎች ሕያው ማስታወሻ ነው።',
    about_body_2: 'ማኩሾቻችን ሙሉ ወርቃማ የኢትዮጵያ ምግብን ያከብራል — ከቀስ ቀስ ከተቀቀለ ዶሮ ወጥ እስከ ውዱ የእንጨት እሳት ፒዛ።',
    about_proverb: '"ቡና ዳቦ ነው"',
    about_proverb_tr: 'ቡና ዳቦ ነው — የኢትዮጵያ ብሂል',
    about_f1_title: 'የኢትዮጵያ ቁርስ',
    about_f1_desc: 'ባህላዊ ፍርፍር፣ ጨጨብሳ እና አምባሻ ከሻይ ጋር',
    about_f2_title: 'የእንጨት እሳት ምጣድ',
    about_f2_desc: 'ፒዛ እና እንጀራ በቀን ትኩስ ይዘጋጃሉ',
    about_f3_title: 'ጣሊያናዊ–ኢትዮጵያዊ ድምር',
    about_f3_desc: 'የቤት ፓስታ እና ኢትዮጵያዊ ቀለም ያለው ጣሊያናዊ ምግብ',
    about_f4_title: 'ቡና ስርዓት',
    about_f4_desc: 'ሙሉ ጀበና ስርዓት — ሶስት ዙር ትኩስ ቡና',
    about_f5_title: 'ፆም ምናሌ',
    about_f5_desc: 'ከ15 በላይ ቪጋን ምግቦች ያሉ ልዩ ፆም ምናሌ',
    specials_label: 'የዛሬ ምርጦች',
    specials_title: 'የዛሬ ሼፍ ምርጫዎች',
    menu_label: 'ምናሌ',
    menu_title: 'አቅርቦቶቻችን',
    menu_all: 'ሁሉም',
    menu_fasting_toggle: 'ፆም ብቻ',
    menu_veg_toggle: 'ቬጀቴሪያን ብቻ',
    menu_unavailable: 'አሁን አይገኝም',
    menu_vat_note: 'ሁሉም ዋጋዎች 15% ቫት እና 3% አገልግሎት ክፍያ ያካትታሉ',
    menu_print: 'ምናሌ አትም',
    menu_badge_fasting: 'ፆም',
    menu_badge_veg: 'ቬጀቴሪያን',
    menu_badge_spicy: 'ቅመም',
    events_label: 'ዝግጅቶች',
    events_title: 'ወደፊት በየሮ',
    events_learn_more: 'ተጨማሪ',
    reservation_label: 'ቦታ ምዝገባ',
    reservation_title: 'ቦታዎን ይያዙ',
    reservation_sub: 'ለማይረሳ ምግብ ልምድ ይቀላቀሉን',
    form_name: 'ሙሉ ስም',
    form_phone: 'ስልክ ቁጥር',
    form_date: 'ቀን',
    form_time: 'ሰዓት',
    form_guests: 'የእንግዶች ቁጥር',
    form_special: 'ልዩ ጥያቄዎች',
    form_submit: 'ቦታ ያረጋግጡ',
    form_whatsapp: 'ወይም በዋትሳፕ ይላኩልን',
    form_success_title: 'ቦታ ተያዘ!',
    form_success_sub: 'በቅርቡ እናያችሁ። ማረጋገጫ ዋትሳፕዎ ላይ ይደርሳል።',
    gallery_label: 'ፎቶዎች',
    gallery_title: 'ለዓይን ግብዣ',
    testimonials_label: 'ምስክርነቶች',
    testimonials_title: 'እንግዶቻችን ምን ይላሉ',
    review_name: 'ስምዎ',
    review_message: 'አስተያየትዎ',
    review_submit: 'ያስገቡ',
    review_pending: 'አስተያየትዎ ከአስተዳዳሪ ፈቃድ በኋላ ይታያል።',
    contact_label: 'አድራሻ',
    contact_title: 'የሮ ቡናን ይጎብኙ',
    contact_address: 'አዲስ ገበያ፣ አዲስ አበባ፣ ኢትዮጵያ',
    contact_hours_title: 'የሥራ ሰዓት',
    contact_hours_mf: 'ሰኞ – አርብ',
    contact_hours_sat: 'ቅዳሜ',
    contact_hours_sun: 'እሁድ',
    contact_hours_mf_val: '7:00 ጠዋት – 10:00 ሌሊት',
    contact_hours_sat_val: '7:00 ጠዋት – 11:00 ሌሊት',
    contact_hours_sun_val: '8:00 ጠዋት – 10:00 ሌሊት',
    footer_tagline: 'ከቡናው ትውልድ አገር እስከ ሰሌዳዎ።',
    footer_quick_links: 'ፈጣን ማያያዣዎች',
    footer_hours: 'ሰዓቶች',
    footer_visit: 'ይጎብኙን',
    footer_copy: '© 2025 የሮ ቡና። አዲስ ገበያ፣ አዲስ አበባ።',
    scroll_top: 'ወደ ላይ',
    loading: 'በመጫን ላይ...',
  },
} as const;

export type Lang = 'en' | 'am';
export type TranslationKey = keyof typeof TRANSLATIONS.en;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => TRANSLATIONS.en[key],
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('yeroo:lang') as Lang | null;
    if (stored && (stored === 'en' || stored === 'am')) {
      setLangState(stored);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('yeroo:lang', newLang);
  };

  const t = (key: TranslationKey): string => {
    return (TRANSLATIONS[lang] as Record<string, string>)[key] || TRANSLATIONS.en[key] || key;
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { lang, setLang, t } },
    children
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export { TRANSLATIONS };
