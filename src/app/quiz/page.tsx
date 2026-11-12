import type { Metadata } from 'next';
import { COUNTRIES } from '@/data/countries';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuizClient from '@/components/quiz/QuizClient';
import { Poster } from '@/components/Visuals';

export const metadata: Metadata = {
  title: 'Guess the Country quiz',
  description: 'Three clues about everyday life. Can you name the country? Build a streak and share your score.',
};

export default function QuizPage() {
  return (
    <section className="relative min-h-[80svh]">
      <Poster code="?" />
      <div className="container-x relative pb-48 pt-2">
        <Breadcrumbs items={[{ label: 'Quiz' }]} />
        <p className="kicker mt-6 text-sun">Guess the Country</p>
        <h1 className="h-display mb-8 mt-2 text-4xl drop-shadow-lg sm:text-6xl">Three clues. One country.</h1>
        <QuizClient countries={COUNTRIES.map(({ slug, name, flag, airport, quizClues }) => ({ slug, name, flag, airport, clues: quizClues }))} />
      </div>
    </section>
  );
}
