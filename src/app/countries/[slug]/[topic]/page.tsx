import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COUNTRIES, HOME_SLUG, INDIA, getCountry } from '@/data/countries';
import { METRICS, TOPICS, formatMetric, getTopic } from '@/data/topics';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ShareLink, TrackEvent } from '@/components/Bits';
import { DuelBar } from '@/components/StatBars';
import { Poster, TopicIcon } from '@/components/Visuals';

type Props = { params: Promise<{ slug: string; topic: string }> };

export const generateStaticParams = () => COUNTRIES.flatMap((c) => TOPICS.map((t) => ({ slug: c.slug, topic: t.slug })));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, topic } = await params;
  const c = getCountry(slug);
  const t = getTopic(topic);
  if (!c || !t) return {};
  return {
    title: `${t.title} in ${c.name}`,
    description: c.topics[t.slug].summary,
    alternates: { canonical: `/countries/${c.slug}/${t.slug}` },
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug, topic } = await params;
  const c = getCountry(slug);
  const t = getTopic(topic);
  if (!c || !t) notFound();
  const content = c.topics[t.slug];
  const isHome = c.slug === HOME_SLUG;
  const ti = TOPICS.indexOf(t);
  const nextTopic = TOPICS[(ti + 1) % TOPICS.length];
  const others = COUNTRIES.filter((o) => o.slug !== c.slug);

  return (
    <article>
      <TrackEvent event="topic_view" params={{ country: c.slug, topic: t.slug }} />

      <header className="relative">
        <Poster code={c.airport} />
        <div className="container-x relative pb-12 pt-2">
          <Breadcrumbs
            items={[
              { label: 'Countries', href: '/countries' },
              { label: c.region, href: `/countries#${c.region.toLowerCase()}` },
              { label: c.name, href: `/countries/${c.slug}` },
              { label: t.title },
            ]}
          />
          <p className="kicker mt-8 flex items-center gap-2 text-sun">
            <TopicIcon topic={t.slug} size={20} /> {c.flag} {c.name} · {t.title}
          </p>
          <h1 className="h-display mt-3 max-w-3xl text-4xl drop-shadow-lg sm:text-6xl">{content.headline}</h1>
        </div>
      </header>

      <div className="paper py-12">
        <div className="container-x grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xl font-medium leading-relaxed">{content.summary}</p>
            {content.story?.map((para) => (
              <p key={para.slice(0, 24)} className="mt-5 text-lg leading-relaxed text-ink/90">
                {para}
              </p>
            ))}

            <h2 className="h-display mt-10 text-2xl">Worth knowing</h2>
            <ul className="mt-4 space-y-3">
              {content.highlights.map((h) => (
                <li key={h} className="flex gap-3 rounded-2xl border border-ink/15 bg-white/50 p-4">
                  <span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            {content.mustTry && (
              <p className="mt-6 rounded-2xl bg-sun p-5 text-lg font-semibold">
                <span className="kicker block">Must try</span>
                {content.mustTry}
              </p>
            )}

            <p className="mt-8 text-sm text-ink/75">
              Sources: {content.sources.map((s) => s.label).join('; ')}. Figures: planned source {t.metrics.map((k) => METRICS[k].plannedSource).join(', ')}.
            </p>
          </div>

          <div className="space-y-5">
            <aside className="rounded-3xl border-2 border-ink bg-white/60 p-5" aria-label="Compared with India">
              <p className="kicker">🇮🇳 Compared with India</p>
              <p className="mt-2 text-ink/90">{content.vsIndia}</p>
              <div className="mt-4 space-y-3">
                {t.metrics.map((k) =>
                  isHome ? (
                    <p key={k} className="rounded-2xl bg-ink p-4 text-cream">
                      <span className="block font-mono text-[11px] uppercase tracking-wider text-cream/75">{METRICS[k].label}</span>
                      <span className="h-display text-2xl text-sun">{formatMetric(k, c.metrics[k].value)}</span>
                      {c.metrics[k].isSample && <span className="sample-tag">sample</span>}
                    </p>
                  ) : (
                    <DuelBar
                      key={k}
                      label={METRICS[k].label}
                      a={{ name: 'India', value: INDIA.metrics[k].value, display: formatMetric(k, INDIA.metrics[k].value), isSample: INDIA.metrics[k].isSample }}
                      b={{ name: c.name, value: c.metrics[k].value, display: formatMetric(k, c.metrics[k].value), isSample: c.metrics[k].isSample }}
                    />
                  ),
                )}
              </div>
            </aside>

            <div className="flex flex-wrap gap-3">
              <Link href={`/countries/${c.slug}/${nextTopic.slug}`} className="btn btn-ink">
                Next: {nextTopic.title} →
              </Link>
              <ShareLink title={`${t.title} in ${c.name} | Passport Stories`} />
            </div>
          </div>
        </div>

        {/* Same topic, other countries */}
        <section className="container-x mt-14" aria-labelledby="elsewhere">
          <h2 id="elsewhere" className="h-display text-2xl">
            {t.title} elsewhere
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/countries/${o.slug}/${t.slug}`} className="chip border-ink/25 text-ink hover:border-ink">
                  {o.flag} {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
