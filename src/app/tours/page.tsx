import type { Metadata } from 'next';
import Link from 'next/link';
import { getCountry } from '@/data/countries';
import { TOURS } from '@/data/tours';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Poster, TopicIcon } from '@/components/Visuals';

export const metadata: Metadata = {
  title: 'Theme Tours',
  description: 'Scroll-through stories that follow one topic across many countries: school days, weddings, commutes and home life.',
};

const COLORS = ['#FFB703', '#4CC9F0', '#FB8500', '#06A77D'];

export default function ToursPage() {
  return (
    <>
      <section className="relative">
        <Poster code="TOUR" />
        <div className="container-x relative pb-14 pt-2">
          <Breadcrumbs items={[{ label: 'Theme Tours' }]} />
          <h1 className="h-display mt-6 text-5xl sm:text-7xl">Theme Tours</h1>
          <p className="mt-3 max-w-xl text-lg text-cream/90">One topic, eight countries, one long scroll. Sit back; the plane does the work.</p>
        </div>
      </section>
      <div className="paper py-12">
        <ul className="container-x grid gap-5 md:grid-cols-2">
          {TOURS.map((t, i) => (
            <li key={t.slug}>
              <Link href={`/tours/${t.slug}`} className="flex h-full flex-col rounded-3xl p-6 text-ink transition-transform hover:-translate-y-1" style={{ background: COLORS[i % 4] }}>
                <div className="flex items-center justify-between">
                  <span className="kicker">{t.kicker}</span>
                  <TopicIcon topic={t.topic} size={32} />
                </div>
                <h2 className="h-display mt-8 text-3xl sm:text-4xl">{t.title}</h2>
                <p className="mt-3 flex-1 text-lg">{t.intro}</p>
                <p className="mt-5 text-2xl" aria-label={`Stops: ${t.stops.map((s) => getCountry(s)?.name).join(', ')}`}>
                  {t.stops.map((s) => getCountry(s)?.flag).join(' ')}
                </p>
                <p className="mt-4 font-mono text-sm font-medium">Start tour →</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
