'use client';

/**
 * Explore Map: the globe coloured by a topic layer (work hours, school
 * starting age, paid holidays...). The page works out colours and legends
 * on the server; this component just switches between them.
 */
import { useCallback, useState } from 'react';
import Link from 'next/link';
import type { CountryLite } from '@/data/countries/lite';
import WorldStage from '../globe/WorldStage';

export interface Layer {
  key: string;
  label: string;
  short: string;
  topicSlug: string;
  plannedSource: string;
  /** country slug -> fill colour */
  colors: Record<string, string>;
  /** country slug -> formatted value */
  displays: Record<string, string>;
  legend: { color: string; label: string }[];
  /** Slugs from highest to lowest value. */
  ranked: string[];
  isSample: boolean;
}

export default function ExploreClient({ countries, layers }: { countries: CountryLite[]; layers: Layer[] }) {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<CountryLite | null>(null);
  const layer = layers[active];
  const bySlug = new Map(countries.map((c) => [c.slug, c]));

  const colorOf = useCallback((c: CountryLite) => layer.colors[c.slug], [layer]);
  const detail = useCallback((c: CountryLite) => `${layer.short}: ${layer.displays[c.slug]}`, [layer]);

  return (
    <>
      <div className="stars">
        <div className="container-x">
          <div role="group" aria-label="Map layers" className="flex gap-2 overflow-x-auto pb-3">
            {layers.map((l, i) => (
              <button key={l.key} className="chip shrink-0 text-cream" aria-pressed={i === active} onClick={() => setActive(i)}>
                {l.short}
              </button>
            ))}
          </div>
        </div>

        <div className="relative h-[72svh] min-h-[420px]">
          <WorldStage countries={countries} colorOf={colorOf} detail={detail} onPick={setSelected} arcs={false} wheelZoom />

          {/* Legend */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[70%] rounded-2xl bg-night/85 p-3 backdrop-blur">
            <p className="text-sm font-bold text-cream">
              {layer.label}
              {layer.isSample && <span className="sample-tag">sample</span>}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {layer.legend.map((b) => (
                <li key={b.label} className="flex items-center gap-1.5 font-mono text-[11px] text-cream">
                  <span className="h-3 w-5 rounded-sm" style={{ background: b.color }} />
                  {b.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Selected country */}
          {selected && (
            <div className="paper absolute bottom-3 right-3 z-10 w-64 rounded-2xl p-4 shadow-ticket" aria-live="polite">
              <button onClick={() => setSelected(null)} aria-label="Close" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-ink/70">
                ✕
              </button>
              <p className="kicker text-ink/70">{layer.short}</p>
              <p className="h-display text-2xl text-ink">
                {selected.flag} {selected.name}
              </p>
              <p className="h-display mt-1 text-3xl text-coral">{layer.displays[selected.slug]}</p>
              <div className="mt-3 flex flex-col gap-1 font-mono text-sm font-medium text-ink">
                <Link className="underline underline-offset-4" href={`/countries/${selected.slug}/${layer.topicSlug}`}>
                  Read the story →
                </Link>
                {selected.slug !== 'india' && (
                  <Link className="underline underline-offset-4" href={`/compare/india-vs-${selected.slug}`}>
                    Compare with India →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The same data as a ranked list: readable without the map */}
      <section className="paper py-12" aria-labelledby="rank-title">
        <div className="container-x">
          <h2 id="rank-title" className="h-display text-3xl">
            {layer.label}: all 20 countries
          </h2>
          <p className="mt-2 text-sm text-ink/75">
            Planned source: {layer.plannedSource}.{layer.isSample && ' Current figures are sample values and have not been verified.'}
          </p>
          <ol className="mt-6 grid gap-x-10 sm:grid-cols-2">
            {layer.ranked.map((slug, i) => {
              const c = bySlug.get(slug)!;
              return (
                <li key={slug} className="flex items-center gap-3 border-b border-ink/15 py-2.5">
                  <span className="w-7 font-mono text-sm text-ink/70">{String(i + 1).padStart(2, '0')}</span>
                  <span className="h-4 w-4 shrink-0 rounded-full border border-ink/30" style={{ background: layer.colors[slug] }} aria-hidden />
                  <Link href={`/countries/${slug}/${layer.topicSlug}`} className="flex-1 font-semibold underline-offset-4 hover:underline">
                    {c.flag} {c.name}
                  </Link>
                  <span className="font-mono text-sm font-medium">{layer.displays[slug]}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
