import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COUNTRIES, HOME_SLUG, INDIA, getCountry } from '@/data/countries';
import { METRICS, TOPICS, formatMetric } from '@/data/topics';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CountryVisit, DidYouKnow, ShareLink } from '@/components/Bits';
import { DuelBar } from '@/components/StatBars';
import { Poster, StatText, TopicIcon } from '@/components/Visuals';

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => COUNTRIES.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCountry((await params).slug);
  if (!c) return {};
  return {
    title: `Everyday life in ${c.name}`,
    description: `How people in ${c.name} work, study, marry, eat, live and commute, compared with India. ${c.tagline}`,
    alternates: { canonical: `/countries/${c.slug}` },
  };
}

export default async function CountryPage({ params }: Props) {
  const c = getCountry((await params).slug);
  if (!c) notFound();
  const isHome = c.slug === HOME_SLUG;
  const index = COUNTRIES.indexOf(c);
  const next = COUNTRIES[(index + 1) % COUNTRIES.length];

  return (
    <article>
      <CountryVisit country={{ slug: c.slug, name: c.name, airport: c.airport }} />

      {/* Cover */}
      <header className="relative">
        <Poster code={c.airport} />
        <div className="container-x relative pb-10 pt-2">
          <Breadcrumbs
            items={[
              { label: 'Countries', href: '/countries' },
              { label: c.region, href: `/countries#${c.region.toLowerCase()}` },
              { label: c.name },
            ]}
          />
          <p className="kicker mt-8 text-sun">
            {INDIA.airport} → {c.airport} · {c.region}
          </p>
          <h1 className="h-display mt-2 text-6xl drop-shadow-lg sm:text-8xl">
            <span aria-hidden className="mr-3 align-middle text-5xl sm:text-7xl">
              {c.flag}
            </span>
            {c.name}
          </h1>
          <p className="mt-4 max-w-xl text-xl font-medium text-cream sm:text-2xl">{c.tagline}</p>

          {/* Quick facts strip */}
          <dl className="paper mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl p-5 shadow-ticket lg:grid-cols-4">
            {(
              [
                ['Population', c.quickFacts.population],
                ['Capital', c.quickFacts.capital],
                ['Currency', c.quickFacts.currency],
                ['Language', c.quickFacts.language],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-ink/70">{label}</dt>
                <dd className="mt-0.5 font-semibold leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Contents: jump to a topic */}
      <nav aria-label="Topics on this page" className="sticky top-16 z-30 border-b border-ink/15 bg-cream/95 backdrop-blur">
        <ul className="container-x flex gap-1 overflow-x-auto py-2 text-ink">
          {TOPICS.map((t) => (
            <li key={t.slug} className="shrink-0">
              <a href={`#${t.slug}`} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold hover:bg-ink hover:text-cream">
                <TopicIcon topic={t.slug} size={18} />
                {t.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Six spreads */}
      <div className="paper">
        {TOPICS.map((t, i) => {
          const content = c.topics[t.slug];
          return (
            <section key={t.slug} id={t.slug} className="scroll-mt-32 border-b-2 border-dashed border-ink/15 py-14" aria-labelledby={`${t.slug}-title`}>
              <div className={`container-x grid gap-8 lg:grid-cols-2 lg:gap-14 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <div>
                  <p className="kicker flex items-center gap-2 text-ink/70">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream">
                      <TopicIcon topic={t.slug} size={18} />
                    </span>
                    {String(i + 1).padStart(2, '0')} · {t.title}
                  </p>
                  <h2 id={`${t.slug}-title`} className="h-display mt-4 text-3xl sm:text-5xl">
                    {content.headline}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-ink/90">{content.summary}</p>
                  <ul className="mt-5 space-y-2">
                    {content.highlights.map((h) => (
                      <li key={h} className="flex gap-3">
                        <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  {content.mustTry && (
                    <p className="mt-5 rounded-2xl bg-sun p-4 font-semibold">
                      <span className="kicker block">Must try</span>
                      {content.mustTry}
                    </p>
                  )}
                  <Link href={`/countries/${c.slug}/${t.slug}`} className="mt-6 inline-block font-mono text-sm font-medium underline underline-offset-4">
                    Read the full {t.title.toLowerCase()} page →
                  </Link>
                </div>

                <div className="space-y-4">
                  {/* Key numbers */}
                  <dl className="grid grid-cols-2 gap-3">
                    {t.metrics.map((k) => (
                      <div key={k} className="rounded-2xl bg-ink p-4 text-cream">
                        <dt className="font-mono text-[11px] uppercase tracking-wider text-cream/75">{METRICS[k].short}</dt>
                        <dd className="h-display mt-1 text-2xl text-sun sm:text-3xl">
                          <StatText text={formatMetric(k, c.metrics[k].value)} stat={c.metrics[k]} />
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {/* Compared with India */}
                  <aside className="rounded-3xl border-2 border-ink bg-white/60 p-5" aria-label="Compared with India">
                    <p className="kicker text-ink">🇮🇳 Compared with India</p>
                    <p className="mt-2 text-ink/90">{content.vsIndia}</p>
                    {!isHome && (
                      <div className="mt-4 space-y-3">
                        {t.metrics.map((k) => (
                          <DuelBar
                            key={k}
                            label={METRICS[k].label}
                            a={{ name: 'India', value: INDIA.metrics[k].value, display: formatMetric(k, INDIA.metrics[k].value), isSample: INDIA.metrics[k].isSample }}
                            b={{ name: c.name, value: c.metrics[k].value, display: formatMetric(k, c.metrics[k].value), isSample: c.metrics[k].isSample }}
                          />
                        ))}
                      </div>
                    )}
                    <Link href={isHome ? '/compare/india-vs-japan' : `/compare/india-vs-${c.slug}`} className="mt-4 inline-block font-mono text-sm font-medium underline underline-offset-4">
                      {isHome ? 'Compare India with Japan →' : `Full comparison: India vs ${c.name} →`}
                    </Link>
                  </aside>
                </div>
              </div>
            </section>
          );
        })}

        {/* Sign-off */}
        <section className="container-x grid gap-6 py-14 md:grid-cols-2">
          <DidYouKnow facts={c.facts.map((text) => ({ text, country: c.name }))} />
          <div className="rounded-3xl bg-ink p-6 text-cream">
            <p className="kicker text-sun">Next</p>
            <h2 className="h-display mt-2 text-3xl">{isHome ? 'See your life abroad' : `Could you live in ${c.name}?`}</h2>
            <p className="mt-2 text-cream/85">Enter your salary, rent and hours and get a boarding pass with your numbers.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={isHome ? '/your-life' : `/your-life/${c.slug}`} className="btn btn-sun">
                Try Your Life {isHome ? 'abroad' : `in ${c.name}`} →
              </Link>
              <Link href={`/countries/${next.slug}`} className="btn btn-ghost">
                Next stop: {next.flag} {next.name}
              </Link>
            </div>
          </div>
        </section>

        <footer className="container-x flex flex-wrap items-center justify-between gap-4 pb-14">
          <p className="max-w-2xl text-sm text-ink/75">
            Sources for this page: {c.sources.map((s) => s.label).join('; ')}.{' '}
            <Link href="/about#sources" className="underline underline-offset-4">
              How we gather data
            </Link>
          </p>
          <ShareLink title={`Everyday life in ${c.name} | Passport Stories`} />
        </footer>
      </div>
    </article>
  );
}
