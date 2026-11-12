'use client';

/**
 * Guess the Country.
 * Five rounds. Each round reveals up to three lifestyle clues, hardest
 * first. Guess after one clue for 3 points, two clues for 2, three for 1.
 */
import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { track } from '@/lib/analytics';
import { recordQuiz, usePassport } from '@/lib/passport';
import { downloadStoryCard } from '@/lib/shareCard';

export interface QuizCountry {
  slug: string;
  name: string;
  flag: string;
  airport: string;
  clues: [string, string, string];
}

interface Round {
  answer: QuizCountry;
  options: QuizCountry[];
}

const ROUNDS = 5;
const MAX = ROUNDS * 3;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const rankFor = (score: number) => (score >= 13 ? 'Captain' : score >= 9 ? 'Frequent Flyer' : score >= 5 ? 'Window Seat' : 'Lost Luggage');

export default function QuizClient({ countries }: { countries: QuizCountry[] }) {
  const passport = usePassport();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [busy, setBusy] = useState(false);

  const start = () => {
    const answers = shuffle(countries).slice(0, ROUNDS);
    setRounds(answers.map((answer) => ({ answer, options: shuffle([answer, ...shuffle(countries.filter((c) => c !== answer)).slice(0, 3)]) })));
    setIndex(0);
    setShown(1);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrect(0);
    setPhase('play');
  };

  const round = rounds[index];

  const guess = (slug: string) => {
    if (picked) return;
    setPicked(slug);
    if (slug === round.answer.slug) {
      setScore((s) => s + (4 - shown));
      setCorrect((c) => c + 1);
      setStreak((s) => {
        setBestStreak((b) => Math.max(b, s + 1));
        return s + 1;
      });
    } else setStreak(0);
  };

  const next = () => {
    if (index + 1 < ROUNDS) {
      setIndex(index + 1);
      setShown(1);
      setPicked(null);
      return;
    }
    setPhase('done');
    recordQuiz(score, MAX, bestStreak);
    track('quiz_completed', { quiz_score: score, max_score: MAX, correct_answers: correct, best_streak: bestStreak });
  };

  const download = async () => {
    setBusy(true);
    await downloadStoryCard({
      filename: `passport-stories-quiz-${score}.png`,
      kicker: 'Guess the Country',
      title: `I scored ${score} out of ${MAX}`,
      from: 'QUIZ',
      to: `${score}/${MAX}`,
      rows: [
        { label: 'Rank', value: rankFor(score) },
        { label: 'Countries guessed', value: `${correct} of ${ROUNDS}` },
        { label: 'Best streak', value: `${bestStreak} in a row` },
      ],
      quote: 'Three clues about everyday life. Can you name the country faster?',
    });
    track('share_card_downloaded', { card_type: 'quiz', quiz_score: score });
    setBusy(false);
  };

  /* ------------------------------- Intro ------------------------------ */
  if (phase === 'intro') {
    return (
      <div className="paper mx-auto max-w-2xl rounded-3xl p-6 shadow-ticket sm:p-8">
        <p className="kicker text-ink/70">How it works</p>
        <ol className="mt-3 space-y-2 text-lg">
          <li>
            <strong>1.</strong> You get a clue about everyday life somewhere.
          </li>
          <li>
            <strong>2.</strong> Guess now for 3 points, or reveal more clues for fewer points.
          </li>
          <li>
            <strong>3.</strong> Five countries. {MAX} points to win. Streaks earn badges.
          </li>
        </ol>
        <button onClick={start} className="btn btn-ink mt-6">
          Start round one →
        </button>
        {passport.quiz.played > 0 && (
          <p className="mt-4 font-mono text-sm text-ink/75">
            Your best so far: {passport.quiz.best}/{MAX} · best streak {passport.quiz.bestStreak}
          </p>
        )}
      </div>
    );
  }

  /* ------------------------------ Results ----------------------------- */
  if (phase === 'done') {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="paper mx-auto max-w-2xl overflow-hidden rounded-3xl text-center shadow-ticket">
        <p className="bg-teal px-5 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink">Arrivals · Final score</p>
        <div className="p-6 sm:p-10">
          <p className="h-display text-7xl text-coral sm:text-8xl">
            {score}
            <span className="text-3xl text-ink/60">/{MAX}</span>
          </p>
          <p className="h-display mt-2 text-3xl">{rankFor(score)}</p>
          <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-4">
            <div className="rounded-2xl bg-ink p-3 text-cream">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-cream/75">Guessed</dt>
              <dd className="h-display text-2xl text-sun">
                {correct} of {ROUNDS}
              </dd>
            </div>
            <div className="rounded-2xl bg-ink p-3 text-cream">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-cream/75">Best streak</dt>
              <dd className="h-display text-2xl text-sun">{bestStreak}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={download} disabled={busy} className="btn btn-sun">
              <span aria-hidden>⬇</span> {busy ? 'Printing…' : 'Download score card'}
            </button>
            <button onClick={start} className="btn btn-ink">
              Play again
            </button>
            <Link href="/passport" className="btn btn-ghost-ink">
              See my badges
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ------------------------------- Round ------------------------------ */
  const isRight = picked === round.answer.slug;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between font-mono text-sm text-cream">
        <span>
          Round {index + 1}/{ROUNDS}
        </span>
        <span aria-live="polite">
          Score {score} · Streak {streak} {streak >= 2 && <span aria-hidden>🔥</span>}
        </span>
      </div>

      <div className="paper overflow-hidden rounded-3xl shadow-ticket">
        <p className="flex justify-between bg-teal px-5 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink">
          <span>Mystery destination</span>
          <span>Worth {picked ? (isRight ? 4 - shown : 0) : 4 - shown} pts</span>
        </p>
        <ol className="space-y-3 p-5 sm:p-7" aria-live="polite">
          <AnimatePresence initial={false}>
            {round.answer.clues.slice(0, picked ? 3 : shown).map((clue, i) => (
              <motion.li key={`${index}-${i}`} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 rounded-2xl border border-ink/15 bg-white/60 p-4">
                <span className="h-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm text-cream">{i + 1}</span>
                <span className="text-lg font-medium leading-snug">{clue}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>

        {!picked && shown < 3 && (
          <div className="px-5 pb-2 sm:px-7">
            <button onClick={() => setShown(shown + 1)} className="font-mono text-sm font-medium underline underline-offset-4">
              Reveal another clue (worth {4 - shown - 1} {4 - shown - 1 === 1 ? 'pt' : 'pts'}) →
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 p-5 sm:p-7">
          {round.options.map((o) => {
            const state = !picked ? 'idle' : o.slug === round.answer.slug ? 'right' : o.slug === picked ? 'wrong' : 'dim';
            return (
              <button
                key={o.slug}
                onClick={() => guess(o.slug)}
                disabled={!!picked}
                className={`min-h-[56px] rounded-2xl border-2 px-3 py-2 text-left text-base font-bold transition-colors sm:text-lg ${
                  state === 'idle'
                    ? 'border-ink/25 hover:border-ink hover:bg-ink hover:text-cream'
                    : state === 'right'
                      ? 'border-teal bg-teal text-ink'
                      : state === 'wrong'
                        ? 'border-coral bg-coral text-ink'
                        : 'border-ink/10 text-ink/50'
                }`}
              >
                <span aria-hidden>{o.flag}</span> {o.name}
                {state === 'right' && <span className="sr-only"> (correct answer)</span>}
                {state === 'wrong' && <span className="sr-only"> (your answer, incorrect)</span>}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="perforation" style={{ ['--notch' as string]: '#0D0F3A' }}>
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-7" role="status">
              <p className="text-lg font-bold">
                {isRight ? `Correct, +${4 - shown}. ` : 'Not this time. '}
                It was {round.answer.flag} {round.answer.name}.{' '}
                <Link href={`/countries/${round.answer.slug}`} className="font-mono text-sm font-medium underline underline-offset-4" target="_blank">
                  Read more
                </Link>
              </p>
              <button onClick={next} className="btn btn-ink" autoFocus>
                {index + 1 < ROUNDS ? 'Next country →' : 'See my score →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
