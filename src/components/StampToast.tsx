'use client';

/**
 * Shows the "stamp slam" whenever a stamp or badge is earned.
 * lib/passport.ts fires a `ps:toast` window event; this listens for it.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { ToastDetail } from '@/lib/passport';
import Stamp from './Stamp';

export default function StampToast() {
  const [toast, setToast] = useState<(ToastDetail & { id: number }) | null>(null);

  useEffect(() => {
    let timer: number;
    const onToast = (e: Event) => {
      setToast({ ...(e as CustomEvent<ToastDetail>).detail, id: Date.now() });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('ps:toast', onToast);
    return () => {
      window.removeEventListener('ps:toast', onToast);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="paper pointer-events-auto flex items-center gap-4 rounded-2xl py-3 pl-3 pr-5 shadow-ticket"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            {/* The stamp drops from above and lands with a small overshoot. */}
            <motion.div
              initial={{ scale: 2.6, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 520, damping: 17 }}
            >
              <Stamp code={toast.code} name={toast.title} size={84} label={toast.kind === 'badge' ? 'BADGE' : 'ARRIVED'} />
            </motion.div>
            <div>
              <p className="kicker text-ink/70">{toast.note}</p>
              <p className="h-display text-2xl text-ink">{toast.title}</p>
              <Link href="/passport" className="text-sm font-semibold text-ink underline underline-offset-4">
                Open your passport
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
