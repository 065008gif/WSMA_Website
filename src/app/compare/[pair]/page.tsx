import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COUNTRIES, pairSlug, parsePair } from '@/data/countries';
import { METRICS, TOPICS, formatMetric } from '@/data/topics';
import type { MetricKey } from '@/data/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ShareLink, TrackEvent } from '@/components/Bits';
import ComparePicker from '@/components/compare/ComparePicker';
import { DuelBar } from '@/components/StatBars';
import { Poster, TopicIcon } from '@/components/Visuals';

type Props = { params: Promise<{ pair: string }> };

// Every ordered pair gets its own shareable, pre-built page.
export const generateStaticParams = () =>
  COUNTRIES.flatMap((a) => COUNTRIES.filter((b) => b !== a).map((b) => ({ pair: pairSlug(a.slug, b.slug) })));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pair = parsePair((await params).pair);
  if (!pair) return {};
  const [a, b] = pair;
  return {
    title: `${a.name} vs ${b.name}: everyday life compared`,
    description: `Work, school, weddings, food, housing and transport in ${a.name} and ${b.name}, side by side.`,
    alternates: { canonical: `/compare/${pairSlug(a.slug, b.slug)}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const pair = parsePair((await params).pair);
  if (!pair) notFound();
  const [a, b] = pair;

  // Rank every metric by how far apart the two countries are.
  const keys = Object.keys(METRICS) as MetricKey[];
  const gap = (k: MetricKey) => {
    const x = a.metrics[k].value;
    const y = b.metrics[k].value;
    return Math.abs(x - y) / Math.max(x, y, 0.0001);
  };
  const biggest = [...keys].sort((x, y) => gap(y) - gap(x)).slice(0, 3);

  const side = (c: typeof a, k: MetricKey) => ({
    name: c.name,
    value: c.metrics[k].value,
    display: formatMetric(k, c.metrics[k].value),
    isSample: c.metrics[k].isSample,
  });

  return (
    <article>
      <TrackEvent event="compare_run" params={{ country_a: a.slug, country_b: b.slug, comparison_pair: pairSlug(a.slug, b.slug) }} badge="side-by-side" />

      <header className="relative">
        <Poster code="VS" />
        <div className="container-x relative pb-10 pt-2">
          <Breadcrumbs items={[{ label: 'Compare', href: '/compare' }, { label: `${a.name} vs ${b.name}` }]} />
          <h1 className="h-display mt-6 text-4xl drop-shadow-lg sm:text-7xl">
            {a.flag} {a.name} <span className="text-sun">vs</span> {b.flag} {b.name}
          </h1>
          <div className="mt-6 max-w-2xl rounded-2xl bg-night/75 p-4 backdrop-blur">
            <ComparePicker options={COUNTRIES.map(({ slug, name, flag }) => ({ slug, name, flag }))} a={a.slug} b={b.slug} />
          </div>
        </div>
      </header>

      <div className="paper py-12">
        {/* Biggest differences */}
        <section className="container-x" aria-labelledby="biggest">
          <p className="kicker text-ink/70">At a glance</p>
          <h2 id="biggest" className="h-display mt-1 text-3xl sm:text-4xl">
            The three biggest differences
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {biggest.map((k, i) => (
              <li key={k} className="rounded-3xl bg-ink p-5 text-cream">
                <p className="kicker text-sun">
                  #{i + 1} · {METRICS[k].short}
                </p>
                <p className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{a.name}</span>
                  <span className="h-display text-2xl text-cream">{formatMetric(k, a.metrics[k].value)}</span>
                </p>
                <p className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{b.name}</span>
                  <span className="h-display text-2xl text-sun">{formatMetric(k, b.metrics[k].value)}</span>
                </p>
                {(a.metrics[k].isSample || b.metrics[k].isSample) && <span className="sample-tag mt-2">sample</span>}
              </li>
            ))}
          </ol>
        </section>

        {/* All six topics */}
        {TOPICS.map((t, i) => (
          <section key={t.slug} className="container-x mt-14 border-t-2 border-dashed border-ink/15 pt-10" aria-labelledby={`cmp-${t.slug}`}>
            <h2 id={`cmp-${t.slug}`} className="h-display flex items-center gap-3 text-2xl sm:text-4xl">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-cream">
                <TopicIcon topic={t.slug} size={22} />
              </span>
              {String(i + 1).padStart(2, '0')} {t.title}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[a, b].map((c, ci) => (
                <div key={c.slug} className={`rounded-3xl border-2 p-5 ${ci === 0 ? 'border-ink' : 'border-coral'} bg-white/50`}>
                  <p className="kicker text-ink/70">
                    {c.flag} {c.name}
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-snug">{c.topics[t.slug].headline}</h3>
                  <p className="mt-2 text-ink/85">{c.topics[t.slug].summary}</p>
                  <Link href={`/countries/${c.slug}/${t.slug}`} className="mt-3 inline-block font-mono text-sm font-medium underline underline-offset-4">
                    More on {c.name} →
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {t.metrics.map((k) => (
                <DuelBar key={k} label={METRICS[k].label} a={side(a, k)} b={side(b, k)} highlight={biggest.includes(k)} />
              ))}
            </div>
          </section>
        ))}

        <footer className="container-x mt-14 flex flex-wrap items-center gap-3">
          <ShareLink title={`${a.name} vs ${b.name} | Passport Stories`} className="btn btn-ink" />
          <Link href={`/your-life/${b.slug === 'india' ? a.slug : b.slug}`} className="btn btn-ghost-ink">
            Try Your Life in {b.slug === 'india' ? a.name : b.name} →
          </Link>
          <p className="basis-full text-sm text-ink/75">
            Figures marked sample are placeholders awaiting verification.{' '}
            <Link href="/about#sources" className="underline underline-offset-4">
              Sources
            </Link>
          </p>
        </footer>
      </div>
    </article>
  );
}
