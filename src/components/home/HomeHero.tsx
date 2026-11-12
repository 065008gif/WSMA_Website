'use client';

/**
 * Home page hero: headline on the left, the interactive globe on the right
 * (stacked on phones), plus the Country of the Week ticket underneath.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CountryLite } from '@/data/countries/lite';
import { site } from '@/data/site';
import { weekNumber } from '@/lib/week';
import BoardingPass, { type PassRow } from '../BoardingPass';
import { TeleportButton } from '../Bits';
import WorldStage from '../globe/WorldStage';

export interface WeekCard {
  slug: string;
  headline: string;
  rows: PassRow[];
}

export default function HomeHero({
  countries,
  weekCards,
  initialWeekSlug,
}: {
  countries: CountryLite[];
  /** Teaser content for every country that can be Country of the Week, in rotation order. */
  weekCards: WeekCard[];
  /** The pick at build time; corrected in the browser if the week has changed. */
  initialWeekSlug: string;
}) {
  const [weekSlug, setWeekSlug] = useState(initialWeekSlug);

  // The site is statically built, so re-check the calendar week in the browser.
  useEffect(() => {
    if (site.countryOfTheWeek) return;
    setWeekSlug(weekCards[weekNumber(new Date()) % weekCards.length].slug);
  }, [weekCards]);

  const list = countries;
  const india = list.find((c) => c.slug === 'india')!;
  const week = list.find((c) => c.slug === weekSlug) || list[1];
  const card = weekCards.find((w) => w.slug === week.slug);

  return (
    <>
      <section className="stars relative overflow-hidden">
        <div className="container-x relative z-10 grid items-center gap-2 pt-8 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:pt-0">
          <div className="max-w-xl">
            <p className="kicker text-sun">{site.tagline}</p>
            <h1 className="h-display mt-3 text-4xl text-cream sm:text-5xl xl:text-6xl">
              Pick a country. Borrow someone else’s <span className="text-sun">ordinary day.</span>
            </h1>
            <p className="mt-4 text-lg text-cream/85">
              How do people in 20 countries work, study, marry, eat, live and get around? Spin the globe, tap a glowing country and see how it
              compares with India.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/your-life" className="btn btn-sun">
                Try Your Life abroad →
              </Link>
              <TeleportButton countries={list.filter((c) => c.slug !== 'india')} />
            </div>
          </div>

          <div className="relative h-[52svh] min-h-[320px] lg:h-[82svh]">
            <WorldStage countries={list} ringSlug={week.slug} listenForTeleport />
            <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center font-mono text-[11px] uppercase tracking-widest text-cream/70">
              Drag to spin · tap a glowing country
            </p>
          </div>
        </div>
      </section>

      {/* Country of the Week */}
      <section className="bg-gradient-to-b from-night to-ink pb-16 pt-10" aria-labelledby="cotw">
        <div className="container-x grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="kicker text-sun">Now boarding · changes every Monday</p>
            <h2 id="cotw" className="h-display mt-2 text-4xl sm:text-5xl">
              Country of the Week
            </h2>
            <p className="mt-3 text-lg text-cream/85">{card?.headline}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/countries/${week.slug}`} className="btn btn-sun">
                Explore {week.name} →
              </Link>
              <Link href={`/compare/india-vs-${week.slug}`} className="btn btn-ghost">
                India vs {week.name}
              </Link>
            </div>
          </div>
          <BoardingPass
            kicker="Country of the week"
            notch="#151849"
            from={{ code: india.airport, label: 'India' }}
            to={{ code: week.airport, label: `${week.flag} ${week.name}` }}
            rows={card?.rows}
          >
            <p className="text-ink/85">{week.tagline}</p>
          </BoardingPass>
        </div>
      </section>
    </>
  );
}
