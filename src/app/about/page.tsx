import type { Metadata } from 'next';
import Link from 'next/link';
import { COUNTRIES } from '@/data/countries';
import { PLANNED_SOURCES } from '@/data/helpers';
import { site } from '@/data/site';
import { METRICS } from '@/data/topics';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Poster } from '@/components/Visuals';

export const metadata: Metadata = {
  title: 'About & Sources',
  description: 'Who makes Passport Stories, how the data is gathered, and the full list of sources.',
};

export default function AboutPage() {
  const metrics = Object.values(METRICS);
  const allStats = COUNTRIES.flatMap((c) => [...Object.values(c.metrics), c.life.costIndex, c.life.perINR, c.life.rentShare]);
  const sampleCount = allStats.filter((s) => s.isSample).length;
  const richCount = COUNTRIES.filter((c) => c.isRich).length;

  return (
    <>
      <section className="relative">
        <Poster code="PS" />
        <div className="container-x relative pb-14 pt-2">
          <Breadcrumbs items={[{ label: 'About' }]} />
          <p className="kicker mt-6 text-sun">About</p>
          <h1 className="h-display mt-2 max-w-3xl text-5xl drop-shadow-lg sm:text-7xl">{site.tagline}</h1>
        </div>
      </section>

      <div className="paper py-12">
        <div className="container-x max-w-3xl space-y-12 text-lg leading-relaxed">
          <section aria-labelledby="what">
            <h2 id="what" className="h-display text-3xl">
              What this is
            </h2>
            <p className="mt-3">
              Passport Stories explores how people in different countries live an ordinary day: how long they work, when school starts, what a
              wedding looks like, what is for dinner, who shares the house and how everyone gets to work. Every country answers the same six
              questions, so any two can be put side by side.
            </p>
            <p className="mt-3">
              We describe what people commonly do. We do not rank countries or say which way of living is better. Every country is more varied
              than a single page can show, and there are exceptions to everything written here.
            </p>
          </section>

          <section aria-labelledby="who">
            <h2 id="who" className="h-display text-3xl">
              Who made it
            </h2>
            <p className="mt-3">{site.team}</p>
            <p className="mt-3">
              The project lives on this website, on Instagram and on YouTube. Have a country or topic in mind?{' '}
              <Link href="/ask" className="font-semibold underline underline-offset-4">
                Ask the Map
              </Link>
              .
            </p>
          </section>

          <section aria-labelledby="how">
            <h2 id="how" className="h-display text-3xl">
              How the data is gathered
            </h2>
            <p className="mt-3">
              Each country page has two kinds of content: written descriptions of everyday habits, and numbers such as average working hours.
              Descriptions are drafted from general reference reading and then reviewed. Numbers are meant to come from the public sources listed
              below.
            </p>
            <p className="mt-3 rounded-2xl border-2 border-ink bg-white/60 p-4">
              <strong>Status at launch:</strong> {sampleCount} of {allStats.length} figures on the site are{' '}
              <span className="sample-tag ml-0">sample</span> values. They are realistic placeholders, not verified statistics, and are clearly
              tagged wherever they appear. Full-length copy is available for {richCount} countries; the other {COUNTRIES.length - richCount} have
              shorter draft entries. Please do not cite sample figures.
            </p>
            <p className="mt-3">
              The Your Life calculator multiplies your salary by a cost-of-living ratio and an exchange rate, and compares your hours and commute
              with national averages. It is a conversation starter, not financial or relocation advice.
            </p>
          </section>

          <section id="sources" aria-labelledby="sources-title" className="scroll-mt-24">
            <h2 id="sources-title" className="h-display text-3xl">
              Sources
            </h2>
            <p className="mt-3">Data sources the verified figures will be drawn from:</p>
            <ul className="mt-3 space-y-2">
              {PLANNED_SOURCES.map((s) => (
                <li key={s.label} className="flex gap-3">
                  <span aria-hidden className="mt-3 h-2 w-2 shrink-0 rounded-full bg-coral" />
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-base">
                <caption className="mb-2 text-left font-mono text-sm text-ink/75">Where each figure comes from</caption>
                <thead>
                  <tr className="border-b-2 border-ink font-mono text-xs uppercase tracking-wider">
                    <th scope="col" className="py-2 pr-4">
                      Figure
                    </th>
                    <th scope="col" className="py-2 pr-4">
                      Unit
                    </th>
                    <th scope="col" className="py-2">
                      Planned source
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr key={m.key} className="border-b border-ink/15">
                      <th scope="row" className="py-2 pr-4 font-semibold">
                        {m.label}
                      </th>
                      <td className="py-2 pr-4">{m.unit || 'time of day'}</td>
                      <td className="py-2">{m.plannedSource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-base text-ink/80">
              Map shapes: Natural Earth (public domain), via the world-atlas project. Fonts: Bowlby One, DM Sans and DM Mono (SIL Open Font
              License).
            </p>
          </section>

          <section aria-labelledby="privacy">
            <h2 id="privacy" className="h-display text-3xl">
              Your data
            </h2>
            <p className="mt-3">
              Your passport stamps and the numbers you enter in Your Life are stored only in your own browser. The site uses Google Analytics to
              count page views and feature use; salary is never sent, only a broad band.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
