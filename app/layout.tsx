import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, Noto_Sans_Ethiopic } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { I18nProvider } from '@/lib/i18n';
import { Toaster } from 'sonner';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  variable: '--font-noto-ethiopic',
  display: 'swap',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Yeroo Coffee | Premium Ethiopian Café, Addis Ababa',
  description:
    'Experience authentic Ethiopian coffee culture at Yeroo Coffee — premium café and restaurant in Addisu Gebeya, Addis Ababa. Wood-fired kitchen, fresh coffee ceremony, fasting menu.',
  keywords: ['Ethiopian coffee', 'Addis Ababa restaurant', 'Addisu Gebeya café', 'jebena coffee', 'Ethiopian cuisine'],
  openGraph: {
    title: 'Yeroo Coffee | Premium Ethiopian Café, Addis Ababa',
    description: 'From the birthplace of coffee — single-origin Ethiopian beans and traditional cuisine.',
    type: 'website',
    locale: 'en_ET',
  },
  alternates: { canonical: 'https://yeroocoffee.et' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${notoEthiopic.variable}`}
    >
      <body className="font-sans">
        <QueryProvider>
          <I18nProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
