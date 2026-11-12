import type { Metadata } from 'next';
import { COUNTRIES } from '@/data/countries';
import Breadcrumbs from '@/components/Breadcrumbs';
import PassportClient from '@/components/passport/PassportClient';
import { Poster } from '@/components/Visuals';

export const metadata: Metadata = {
  title: 'Your Passport',
  description: 'Every country you explore earns a stamp. Collect all 20, plus badges from the quiz and tours.',
};

export default function PassportPage() {
  return (
    <section className="relative min-h-[80svh]">
      <Poster code="ID" />
      <div className="container-x relative pb-48 pt-2">
        <Breadcrumbs items={[{ label: 'Your Passport' }]} />
        <p className="kicker mt-6 text-sun">Your Passport</p>
        <h1 className="h-display mb-8 mt-2 text-4xl drop-shadow-lg sm:text-6xl">Stamps, badges, bragging rights.</h1>
        <PassportClient countries={COUNTRIES.map(({ slug, name, flag, airport }) => ({ slug, name, flag, airport }))} />
      </div>
    </section>
  );
}
