'use client';

/**
 * WorldStage wraps the map for both the home page and Explore Map.
 *
 * It decides between the 3D globe and the flat map, lazy-loads the heavy
 * 3D code, shows the boarding-pass tooltip, and handles what happens when
 * a country is picked:
 *   - mouse:  click -> camera flies there -> "Now boarding" -> country page
 *   - touch:  tap -> camera flies there and a ticket appears -> "Board"
 * Pass `onPick` to replace that behaviour (Explore Map does).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { CountryLite } from '@/data/countries/lite';
import { useBoard } from '../FlightProvider';
import FlatMap from './FlatMap';
import { type WorldFeature, hasWebGL, isLowPower, loadWorld, prefers3D } from './world';

const GlobeView = dynamic(() => import('./GlobeView'), { ssr: false, loading: () => <GlobeSkeleton /> });

function GlobeSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden>
      <div className="aspect-square h-[70%] max-h-[420px] animate-pulse rounded-full bg-ink shadow-[0_0_80px_rgba(76,201,240,.35)]" />
    </div>
  );
}

export default function WorldStage({
  countries,
  homeSlug = 'india',
  colorOf,
  detail,
  onPick,
  ringSlug,
  arcs = true,
  wheelZoom = false,
  listenForTeleport = false,
}: {
  countries: CountryLite[];
  homeSlug?: string;
  /** Fill colour per country. Defaults to each country's sunset accent. */
  colorOf?: (c: CountryLite) => string;
  /** Extra line in the tooltip, e.g. the selected layer's value. */
  detail?: (c: CountryLite) => string;
  onPick?: (c: CountryLite) => void;
  ringSlug?: string;
  arcs?: boolean;
  wheelZoom?: boolean;
  listenForTeleport?: boolean;
}) {
  const board = useBoard();
  const box = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const tipAt = useRef('translate(-999px, -999px)');
  const [features, setFeatures] = useState<WorldFeature[] | null>(null);
  const [mode, setMode] = useState<'3d' | 'flat' | null>(null);
  const [canUse3D, setCanUse3D] = useState(true);
  const [lowPower, setLowPower] = useState(false);
  const [touch, setTouch] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<CountryLite | null>(null);
  const [picked, setPicked] = useState<CountryLite | null>(null);
  const [focus, setFocus] = useState<CountryLite | null>(null);
  const [altitude, setAltitude] = useState(2.2);

  const home = countries.find((c) => c.slug === homeSlug) || countries[0];
  const fill = useCallback((c: CountryLite) => (colorOf ? colorOf(c) : c.accent), [colorOf]);

  // Work out what this device can handle, then fetch the map shapes.
  useEffect(() => {
    setCanUse3D(hasWebGL());
    setMode(prefers3D() ? '3d' : 'flat');
    setLowPower(isLowPower());
    setTouch(window.matchMedia('(pointer: coarse)').matches);
    setAltitude(window.innerWidth < 640 ? 2.5 : 2.1);
    loadWorld().then(setFeatures).catch(() => setFeatures([]));
  }, []);

  // Keep the canvas the same size as its container.
  useEffect(() => {
    if (!box.current) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) }));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);

  const fly = useCallback(
    (c: CountryLite, delay: number) => {
      setFocus(c);
      window.setTimeout(() => board(`/countries/${c.slug}`, { name: c.name, code: c.airport }), mode === '3d' ? delay : 0);
    },
    [board, mode],
  );

  const pick = useCallback(
    (c: CountryLite) => {
      if (onPick) {
        setFocus(c);
        onPick(c);
      } else if (touch) {
        setFocus(c);
        setPicked(c);
      } else fly(c, 950);
    },
    [onPick, touch, fly],
  );

  // "Teleport me" on the home page: spin to the country, then board.
  useEffect(() => {
    if (!listenForTeleport) return;
    const onTeleport = (e: Event) => {
      const d = (e as CustomEvent<{ slug: string; handled: boolean }>).detail;
      const target = countries.find((c) => c.slug === d.slug);
      if (!target) return;
      d.handled = true;
      setPicked(null);
      fly(target, 1300);
    };
    window.addEventListener('ps:teleport', onTeleport);
    return () => window.removeEventListener('ps:teleport', onTeleport);
  }, [listenForTeleport, countries, fly]);

  // The tooltip follows the pointer without re-rendering React.
  const onMove = (e: React.PointerEvent) => {
    if (!box.current) return;
    const r = box.current.getBoundingClientRect();
    const x = Math.min(e.clientX - r.left + 16, r.width - 250);
    tipAt.current = `translate(${Math.max(8, x)}px, ${e.clientY - r.top + 18}px)`;
    if (tip.current) tip.current.style.transform = tipAt.current;
  };

  const ready = features && mode && size.w > 0;

  return (
    <div ref={box} onPointerMove={onMove} className="relative h-full w-full select-none" style={{ cursor: hover ? 'pointer' : 'grab' }}>
      {!ready && <GlobeSkeleton />}
      {ready && mode === '3d' && (
        <GlobeView
          features={features}
          countries={countries}
          home={home}
          width={size.w}
          height={size.h}
          colorOf={fill}
          hoverSlug={hover?.slug ?? picked?.slug ?? null}
          onHover={setHover}
          onPick={pick}
          focus={focus}
          ringSlug={ringSlug}
          arcs={arcs}
          lowPower={lowPower}
          altitude={altitude}
          wheelZoom={wheelZoom}
        />
      )}
      {ready && mode === 'flat' && (
        <div className="flex h-full items-center">
          <FlatMap features={features} countries={countries} colorOf={fill} hoverSlug={hover?.slug ?? picked?.slug ?? null} onHover={setHover} onPick={pick} />
        </div>
      )}

      {/* Mini boarding-pass tooltip (mouse only) */}
      {hover && !touch && (
        <div ref={tip} style={{ transform: tipAt.current }} className="paper pointer-events-none absolute left-0 top-0 z-10 w-60 overflow-hidden rounded-xl shadow-ticket" role="tooltip">
          <p className="flex justify-between bg-teal px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink">
            <span>Boarding pass</span>
            <span>
              {home.airport} → {hover.airport}
            </span>
          </p>
          <div className="px-3 py-2">
            <p className="h-display text-xl text-ink">
              {hover.flag} {hover.name}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-ink/80">{detail ? detail(hover) : hover.tagline}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink/70">Click to board</p>
          </div>
        </div>
      )}

      {/* Touch: a ticket slides up with a Board button */}
      {picked && !onPick && (
        <div className="paper absolute inset-x-3 bottom-3 z-10 mx-auto max-w-sm overflow-hidden rounded-2xl shadow-ticket">
          <p className="flex justify-between bg-teal px-4 py-1 font-mono text-[10px] uppercase tracking-widest text-ink">
            <span>Boarding pass</span>
            <span>
              {home.airport} → {picked.airport}
            </span>
          </p>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="h-display text-2xl text-ink">
                {picked.flag} {picked.name}
              </p>
              <p className="text-sm leading-snug text-ink/80">{picked.tagline}</p>
            </div>
            <button className="btn btn-ink shrink-0" onClick={() => board(`/countries/${picked.slug}`, { name: picked.name, code: picked.airport })}>
              Board →
            </button>
          </div>
          <button onClick={() => setPicked(null)} aria-label="Close" className="absolute right-1 top-7 flex h-9 w-9 items-center justify-center text-ink/70">
            ✕
          </button>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        {mode === '3d' && (
          <>
            <button onClick={() => setAltitude((a) => Math.max(0.9, a - 0.45))} aria-label="Zoom in" className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-night/70 text-xl text-cream">
              +
            </button>
            <button onClick={() => setAltitude((a) => Math.min(3.4, a + 0.45))} aria-label="Zoom out" className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-night/70 text-xl text-cream">
              −
            </button>
          </>
        )}
        {canUse3D && mode && (
          <button
            onClick={() => setMode((m) => (m === '3d' ? 'flat' : '3d'))}
            className="flex h-11 items-center justify-center rounded-full border border-cream/30 bg-night/70 px-3 font-mono text-[11px] uppercase tracking-wider text-cream"
            aria-label={mode === '3d' ? 'Switch to the flat map' : 'Switch to the 3D globe'}
          >
            {mode === '3d' ? 'Flat' : '3D'}
          </button>
        )}
      </div>
    </div>
  );
}
