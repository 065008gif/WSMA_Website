'use client';

/**
 * Scroll-driven theme tour.
 *
 * The whole tour is one long "flight": the background drifts through deep
 * sunset colours as you scroll, a plane travels down the flight path on the
 * left, and each country lands as a full-screen stop.
 * With reduced motion the stops simply appear as a normal page.
 */
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { earnBadge } from '@/lib/passport';

export interface TourStop {
  slug: string;
  name: string;
  flag: string;
  airport: string;
  headline: string;
  summary: string;
  highlight: string;
  metricLabel: string;
  metricValue: string;
  isSample: boolean;
}

// Deep shades of the brand colours, dark enough for cream text throughout.
const SKY = ['#0D0F3A', '#1B1F5E', '#3B1E63', '#6B2248', '#8A2B2B', '#7A3E00', '#0B4F4A', '#12305E'];

export default function TourScroller({ topicSlug, topicTitle, outro, stops }: { topicSlug: string; topicTitle: string; outro: string; stops: TourStop[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const background = useTransform(
    scrollYProgress,
    stops.map((_, i) => i / (stops.length - 1)),
    stops.map((_, i) => SKY[i % SKY.length]),
  );
  const planeTop = useTransform(scrollYProgress, [0, 1], ['2%', '96%']);
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Reaching the end earns the "Tour Guide" badge.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v > 0.97 && !done.current) {
      done.current = true;
      earnBadge('tour-guide');
    }
  });

  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 50 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: false, margin: '-18% 0px -18% 0px' },
          transition: { duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] as const },
        };

  return (
    <motion.div ref={ref} style={{ background: reduce ? SKY[1] : background }} className="relative">
      {/* Progress bar under the header */}
      <motion.div aria-hidden className="fixed inset-x-0 top-16 z-40 h-1 origin-left bg-sun" style={{ scaleX: barScale }} />

      {/* Flight path with a plane that follows the scroll */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-3 w-8 sm:left-8">
        <div className="sticky top-24 h-[calc(100svh-8rem)]">
          <div className="absolute inset-y-0 left-1/2 border-l-2 border-dashed border-cream/40" />
          <motion.span className="absolute left-1/2 -ml-3 -mt-3 block h-6 w-6 rotate-90 text-center text-xl leading-6 text-sun" style={{ top: planeTop }}>
            ✈
          </motion.span>
        </div>
      </div>

      <ol>
        {stops.map((s, i) => (
          <li key={s.slug} className="relative flex min-h-[100svh] items-center overflow-hidden py-20">
            <span aria-hidden className="h-display pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none text-[42vw] leading-none text-cream/[0.06] sm:text-[30vw]">
              {s.airport}
            </span>
            <div className="container-x relative grid items-center gap-8 pl-14 sm:pl-24 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <motion.p {...enter(0)} className="kicker text-sun">
                  Stop {String(i + 1).padStart(2, '0')} of {String(stops.length).padStart(2, '0')} · {s.airport}
                </motion.p>
                <motion.h2 {...enter(0.05)} className="h-display mt-3 text-5xl text-cream sm:text-7xl">
                  <span aria-hidden className="mr-3">
                    {s.flag}
                  </span>
                  {s.name}
                </motion.h2>
                <motion.p {...enter(0.12)} className="mt-5 text-2xl font-semibold leading-snug text-cream sm:text-3xl">
                  {s.headline}
                </motion.p>
                <motion.p {...enter(0.2)} className="mt-4 max-w-xl text-lg leading-relaxed text-cream/90">
                  {s.summary}
                </motion.p>
                <motion.div {...enter(0.28)}>
                  <Link href={`/countries/${s.slug}/${topicSlug}`} className="mt-6 inline-block font-mono text-sm font-medium text-sun underline underline-offset-4">
                    {topicTitle} in {s.name} →
                  </Link>
                </motion.div>
              </div>

              <motion.div {...enter(0.2)} className="paper rotate-1 rounded-3xl p-6 shadow-ticket">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink/70">{s.metricLabel}</p>
                <p className="h-display mt-1 text-4xl text-coral sm:text-5xl">
                  {s.metricValue}
                  {s.isSample && <span className="sample-tag align-top text-ink">sample</span>}
                </p>
                <div className="my-4 border-t-2 border-dashed border-ink/25" />
                <p className="font-semibold text-ink">{s.highlight}</p>
              </motion.div>
            </div>
          </li>
        ))}
      </ol>

      {/* Landing */}
      <div className="relative flex min-h-[70svh] items-center">
        <div className="container-x pl-14 sm:pl-24">
          <p className="kicker text-sun">Landed</p>
          <p className="h-display mt-3 max-w-3xl text-4xl text-cream sm:text-6xl">{outro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tours" className="btn btn-sun">
              Take another tour →
            </Link>
            <Link href="/quiz" className="btn btn-ghost">
              Test yourself in the quiz
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
