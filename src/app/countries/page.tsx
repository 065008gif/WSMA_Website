import type { Metadata } from 'next';
import Link from 'next/link';
import { COUNTRIES, REGIONS } from '@/data/countries';
import Breadcrumbs from '@/components/Breadcrumbs';
import { TeleportButton } from '@/components/Bits';
import { Poster } from '@/components/Visuals';

export const metadata: Metadata = {
  title: 'Countries',
  description: 'All 20 countries on Passport Stories, grouped by region. Pick one and see how people there live everyday life.',
};

export default function CountriesPage() {
  return (
    <>
      <section className="relative">
        <Poster code="20" />
        <div className="container-x relative pb-14 pt-2">
          <Breadcrumbs items={[{ label: 'Countries' }]} />
          <h1 className="h-display mt-6 text-5xl sm:text-7xl">Countries</h1>
          <p className="mt-3 max-w-xl text-lg text-cream/90">Twenty destinations, one template. Every country answers the same six questions, so any two can be compared.</p>
          <nav aria-label="Regions" className="mt-6 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <a key={r} href={`#${r.toLowerCase()}`} className="chip bg-night/60 text-cream">
                {r}
              </a>
            ))}
            <TeleportButton className="chip bg-night/60 text-cream" countries={COUNTRIES.map(({ slug, name, airport }) => ({ slug, name, airport }))} />
          </nav>
        </div>
      </section>

      <div className="paper py-12">
        <div className="container-x space-y-14">
          {REGIONS.map((region) => (
            <section key={region} id={region.toLowerCase()} className="scroll-mt-24" aria-labelledby={`${region}-title`}>
              <h2 id={`${region}-title`} className="h-display text-3xl sm:text-4xl">
                {region}
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {COUNTRIES.filter((c) => c.region === region).map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/countries/${c.slug}`}
                      className="group flex h-full flex-col rounded-3xl border-2 border-ink/15 bg-white/50 p-5 transition-all hover:-translate-y-1 hover:border-ink"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-4xl" aria-hidden>
                          {c.flag}
                        </span>
                        <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-xs font-medium text-cream">{c.airport}</span>
                      </div>
                      <h3 className="h-display mt-3 text-2xl">{c.name}</h3>
                      <p className="mt-1 flex-1 text-ink/80">{c.tagline}</p>
                      <p className="mt-4 font-mono text-sm font-medium text-ink">
                        Board <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
