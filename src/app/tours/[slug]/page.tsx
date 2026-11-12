import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry } from '@/data/countries';
import { METRICS, formatMetric, getTopic } from '@/data/topics';
import { TOURS, getTour } from '@/data/tours';
import Breadcrumbs from '@/components/Breadcrumbs';
import TourScroller, { type TourStop } from '@/components/tours/TourScroller';
import { Poster } from '@/components/Visuals';

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => TOURS.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tour = getTour((await params).slug);
  return tour ? { title: tour.title, description: tour.intro } : {};
}

export default async function TourPage({ params }: Props) {
  const tour = getTour((await params).slug);
  if (!tour) notFound();
  const topic = getTopic(tour.topic)!;

  // Each stop reuses the country's own copy for the tour's topic.
  const stops: TourStop[] = tour.stops.flatMap((slug) => {
    const c = getCountry(slug);
    if (!c) return [];
    const content = c.topics[tour.topic];
    const stat = c.metrics[tour.metric];
    return [
      {
        slug: c.slug,
        name: c.name,
        flag: c.flag,
        airport: c.airport,
        headline: content.headline,
        summary: content.summary,
        highlight: content.highlights[0],
        metricLabel: METRICS[tour.metric].label,
        metricValue: formatMetric(tour.metric, stat.value),
        isSample: stat.isSample,
      },
    ];
  });

  return (
    <article>
      <header className="relative">
        <Poster code={tour.kicker.replace('Tour ', '')} />
        <div className="container-x relative flex min-h-[70svh] flex-col pb-16 pt-2">
          <Breadcrumbs items={[{ label: 'Theme Tours', href: '/tours' }, { label: tour.title }]} />
          <div className="my-auto">
            <p className="kicker text-sun">
              {tour.kicker} · {stops.length} stops
            </p>
            <h1 className="h-display mt-3 max-w-4xl text-5xl drop-shadow-lg sm:text-8xl">{tour.title}</h1>
            <p className="mt-5 max-w-xl text-xl text-cream/95 sm:text-2xl">{tour.intro}</p>
            <p className="mt-10 font-mono text-sm uppercase tracking-widest text-cream/85">
              Scroll to take off <span aria-hidden>↓</span>
            </p>
          </div>
        </div>
      </header>
      <TourScroller topicSlug={tour.topic} topicTitle={topic.title} outro={tour.outro} stops={stops} />
    </article>
  );
}
