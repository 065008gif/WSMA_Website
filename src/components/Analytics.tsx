'use client';

/**
 * Loads Google Analytics 4 (only when NEXT_PUBLIC_GA_ID is set), remembers
 * UTM parameters on landing, and sends a page_view on every route change.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { GA_ID, captureUtm, pageview } from '@/lib/analytics';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    captureUtm();
  }, []);

  useEffect(() => {
    pageview(pathname);
  }, [pathname]);

  if (!GA_ID) return null;
  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />;
}
