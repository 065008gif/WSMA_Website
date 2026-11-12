'use client';

/**
 * The "Now boarding" page transition.
 *
 * Any component can call `const board = useBoard()` and then
 * `board('/countries/japan', { name: 'Japan', code: 'NRT' })`.
 * A sunset wipe covers the screen while a plane traces a dotted arc, then
 * the new page appears. With reduced motion it is a plain navigation.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface Destination {
  name: string;
  code: string;
}
type Board = (href: string, dest?: Destination) => void;

const FlightContext = createContext<Board>(() => undefined);
export const useBoard = () => useContext(FlightContext);

export default function FlightProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [flight, setFlight] = useState<(Destination & { href: string }) | null>(null);

  const board = useCallback<Board>(
    (href, dest) => {
      if (reduce || !dest) {
        router.push(href);
        return;
      }
      setFlight({ ...dest, href });
      router.prefetch(href);
      window.setTimeout(() => router.push(href), 1000);
      // Safety net: never leave the overlay up if navigation is a no-op.
      window.setTimeout(() => setFlight(null), 3500);
    },
    [reduce, router],
  );

  // Once the new page is showing, lift the overlay.
  useEffect(() => {
    const t = window.setTimeout(() => setFlight(null), 250);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <FlightContext.Provider value={board}>
      {children}
      <AnimatePresence>
        {flight && (
          <motion.div
            key="flight"
            role="status"
            aria-live="polite"
            className="sunset-sky fixed inset-0 z-[70] flex flex-col items-center justify-center px-6 text-center"
            initial={{ clipPath: 'circle(0% at 50% 60%)' }}
            animate={{ clipPath: 'circle(150% at 50% 60%)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
          >
            <svg viewBox="0 0 320 130" className="w-full max-w-md" aria-hidden>
              <motion.path
                d="M20 110 Q160 -40 300 110"
                fill="none"
                stroke="#FFF4E0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1 10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.15 }}
              />
              <circle cx="20" cy="110" r="6" fill="#FFF4E0" />
              <circle cx="300" cy="110" r="6" fill="#FFB703" />
              <motion.text
                fontSize="30"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ offsetPath: "path('M20 110 Q160 -40 300 110')", offsetRotate: 'auto 45deg' }}
                initial={{ offsetDistance: '0%' }}
                animate={{ offsetDistance: '100%' }}
                transition={{ duration: 1, delay: 0.15, ease: 'easeInOut' }}
              >
                ✈
              </motion.text>
            </svg>
            <p className="kicker mt-2 text-cream">Now boarding · Gate {flight.code}</p>
            <p className="h-display mt-2 text-5xl text-cream drop-shadow sm:text-7xl">{flight.name}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </FlightContext.Provider>
  );
}
