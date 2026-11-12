'use client';

/**
 * Top menu shown on every page: logo, main navigation, search button and
 * the passport counter. On small screens the links fold into a full-width
 * "departures" menu.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, site } from '@/data/site';
import { earnBadge, usePassport } from '@/lib/passport';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const stamps = Object.keys(usePassport().stamps).length;
  const clicks = useRef<number[]>([]);

  useEffect(() => setOpen(false), [pathname]);

  // Easter egg: five quick taps on the logo earn the secret "Stowaway" badge.
  const onLogo = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 2500), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      earnBadge('stowaway');
    }
  };

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-night/90 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-sun focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:px-5">
        <Link href="/" onClick={onLogo} className="flex shrink-0 items-center gap-2" aria-label="Passport Stories home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.logo} alt="" width={44} height={44} className="h-11 w-11" />
          <span className="h-display hidden text-[15px] leading-[1.05] text-cream sm:block">
            Passport
            <br />
            Stories
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? 'page' : undefined}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:text-sun ${isActive(n.href) ? 'text-sun' : 'text-cream/90'}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-2">
          <button
            onClick={() => window.dispatchEvent(new Event('ps:search'))}
            className="flex h-11 items-center gap-2 rounded-full border border-cream/25 px-3 text-sm text-cream/90 hover:border-sun"
            aria-label="Search (Ctrl or Command + K)"
          >
            <span aria-hidden className="text-lg leading-none">
              ⌕
            </span>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-cream/30 px-1 font-mono text-[10px] md:inline">⌘K</kbd>
          </button>
          <Link
            href="/passport"
            className="flex h-11 items-center gap-2 rounded-full bg-sun px-3 text-sm font-bold text-ink"
            aria-label={`Your passport: ${stamps} of 20 stamps`}
          >
            <span aria-hidden>🛂</span>
            <span className="font-mono">{stamps}/20</span>
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-xl xl:hidden"
          >
            <span aria-hidden>{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main (mobile)" className="stars max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-cream/10 xl:hidden">
          <p className="kicker px-5 pt-4 text-sun">Departures</p>
          <ul className="px-2 pb-6 pt-2">
            {NAV.map((n, i) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={isActive(n.href) ? 'page' : undefined} className="board-row text-cream">
                  <span className="text-sun">PS{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-sans text-lg font-semibold">{n.label}</span>
                  <span className={isActive(n.href) ? 'text-teal' : 'text-cream/60'}>{isActive(n.href) ? 'HERE' : 'OPEN'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
