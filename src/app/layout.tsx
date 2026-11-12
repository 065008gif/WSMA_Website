import type { Metadata, Viewport } from 'next';
// Self-hosted Google Fonts (via Fontsource): no request to Google at runtime.
import '@fontsource/bowlby-one/400.css';
import '@fontsource-variable/dm-sans/index.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import './globals.css';
import { site } from '@/data/site';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import FlightProvider from '@/components/FlightProvider';
import StampToast from '@/components/StampToast';
import SearchPalette from '@/components/SearchPalette';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: 'website', locale: 'en_IN' },
  twitter: { card: 'summary_large_image' },
  icons: { icon: site.logo },
};

export const viewport: Viewport = { themeColor: '#1B1F5E', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <FlightProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <StampToast />
          <SearchPalette />
        </FlightProvider>
        <Analytics />
      </body>
    </html>
  );
}
