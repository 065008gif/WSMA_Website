import Link from 'next/link';
import { COUNTRIES, HOME_SLUG, countryOfTheWeek } from '@/data/countries';
import { toLite } from '@/data/countries/lite';
import { site } from '@/data/site';
import { TOURS } from '@/data/tours';
import { formatMetric } from '@/data/topics';
import BoardingPass from '@/components/BoardingPass';
import { DidYouKnow } from '@/components/Bits';
import HomeHero, { type WeekCard } from '@/components/home/HomeHero';
import { Reels, StatText, TopicIcon } from '@/components/Visuals';

export default function HomePage() {
  const countries = COUNTRIES.map(toLite);

  // Teaser ticket for each possible Country of the Week (everyone but India).
  const weekCards: WeekCard[] = COUNTRIES.filter((c) => c.slug !== HOME_SLUG).map((c) => ({
    slug: c.slug,
    headline: c.topics['work-life-balance'].headline,
    rows: [
      { label: 'Work week', value: <StatText text={formatMetric('workHours', c.metrics.workHours.value)} stat={c.metrics.workHours} /> },
      { label: 'Paid holidays', value: <StatText text={formatMetric('paidLeave', c.metrics.paidLeave.value)} stat={c.metrics.paidLeave} /> },
      { label: 'Dinner time', value: <StatText text={formatMetric('dinnerTime', c.metrics.dinnerTime.value)} stat={c.metrics.dinnerTime} /> },
    ],
  }));

  const facts = COUNTRIES.flatMap((c) => c.facts.map((text) => ({ text, country: c.name })));

  return (
    <>
      <HomeHero countries={countries} weekCards={weekCards} initialWeekSlug={countryOfTheWeek(new Date(), site.countryOfTheWeek).slug} />

      {/* Try Your Life */}
      <section className="paper py-16" aria-labelledby="life-title">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="kicker text-ink/70">Signature feature</p>
            <h2 id="life-title" className="h-display mt-2 text-4xl sm:text-6xl">
              Your life, <span className="text-coral">somewhere else.</span>
            </h2>
            <p className="mt-4 max-w-lg text-lg text-ink/85">
              Tell us your salary, rent, working hours and commute. We will print you a boarding pass showing what the same life could look like
              in another country, ready to post as a story.
            </p>
            <Link href="/your-life" className="btn btn-ink mt-6">
              Print my boarding pass →
            </Link>
          </div>
          <BoardingPass
            kicker="Example result"
            notch="#FFF4E0"
            className="border-2 border-ink/15 lg:rotate-2"
            from={{ code: 'YOU', label: 'Delhi, India' }}
            to={{ code: 'FRA', label: '🇩🇪 Germany' }}
            rows={[
              { label: 'Work week', value: '34 hrs', note: '13 fewer than now' },
              { label: 'Paid holidays', value: '20 days', note: '5 more than India' },
              { label: 'Commute', value: '60 min/day', note: 'both ways' },
            ]}
          >
            <p className="italic text-ink/85">“Fresh rolls from the bakery on Saturday, a long walk in the woods on Sunday.”</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink/65">Illustration only · sample figures</p>
          </BoardingPass>
        </div>
      </section>

      {/* Departures board: every country, and the keyboard-friendly way in */}
      <section className="bg-ink py-16" aria-labelledby="board-title">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="kicker text-sun">All flights from India</p>
              <h2 id="board-title" className="h-display mt-2 text-4xl sm:text-5xl">
                Departures
              </h2>
            </div>
            <Link href="/countries" className="btn btn-ghost">
              Browse by region
            </Link>
          </div>
          <ul className="mt-6 grid overflow-hidden rounded-2xl border border-cream/15 bg-night md:grid-cols-2">
            {COUNTRIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/countries/${c.slug}`} className="board-row">
                  <span className="font-medium text-sun">{c.airport}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-sans text-base font-semibold text-cream">
                      {c.flag} {c.name}
                    </span>
                    <span className="block truncate font-sans text-xs text-cream/75">{c.tagline}</span>
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-teal">{c.slug === HOME_SLUG ? 'Home' : 'Boarding'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Theme tours */}
      <section className="paper py-16" aria-labelledby="tours-title">
        <div className="container-x">
          <p className="kicker text-ink/70">Scroll-through stories</p>
          <h2 id="tours-title" className="h-display mt-2 text-4xl sm:text-5xl">
            Theme Tours
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOURS.map((t, i) => (
              <li key={t.slug}>
                <Link
                  href={`/tours/${t.slug}`}
                  className="group flex h-full flex-col justify-between rounded-3xl p-5 text-ink transition-transform hover:-translate-y-1"
                  style={{ background: ['#FFB703', '#4CC9F0', '#FB8500', '#06A77D'][i % 4] }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="kicker">{t.kicker}</span>
                      <TopicIcon topic={t.topic} />
                    </div>
                    <h3 className="h-display mt-6 text-2xl">{t.title}</h3>
                  </div>
                  <p className="mt-6 font-mono text-sm font-medium">{t.stops.length} stops · Start tour →</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Did you know + quiz */}
      <section className="stars py-16">
        <div className="container-x grid gap-6 md:grid-cols-2">
          <DidYouKnow facts={facts} />
          <div className="flex flex-col justify-between rounded-3xl border-2 border-cream/20 p-5 sm:p-6">
            <div>
              <p className="kicker text-sky">Guess the country</p>
              <h2 className="h-display mt-2 text-3xl sm:text-4xl">Three clues. One country.</h2>
              <p className="mt-2 text-cream/85">Fewer clues, more points. Build a streak and share your score.</p>
            </div>
            <Link href="/quiz" className="btn btn-sun mt-5 self-start">
              Play the quiz →
            </Link>
          </div>
        </div>
      </section>

      <Reels />
    </>
  );
}
