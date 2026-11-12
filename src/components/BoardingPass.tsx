import type { CSSProperties, ReactNode } from 'react';

/** Dotted flight arc with a small plane, used between two airport codes. */
export function FlightArc({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" className={className} aria-hidden>
      <path d="M8 50 Q100 -18 192 50" fill="none" stroke="#FB8500" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
      <circle cx="8" cy="50" r="4" fill="#1B1F5E" />
      <circle cx="192" cy="50" r="4" fill="#F94144" />
      <text x="100" y="24" fontSize="22" textAnchor="middle" fill="#F94144">
        ✈
      </text>
    </svg>
  );
}

export interface PassRow {
  label: string;
  value: ReactNode;
  note?: ReactNode;
}

/**
 * The boarding pass card: the site's signature way of showing a result or
 * a featured destination.
 *
 * `notch` must match the colour of whatever is behind the card so the
 * punched holes on the perforation look real.
 */
export default function BoardingPass({
  from,
  to,
  kicker = 'Boarding pass',
  rows,
  children,
  notch = '#0D0F3A',
  className = '',
}: {
  from: { code: string; label: string };
  to: { code: string; label: string };
  kicker?: string;
  rows?: PassRow[];
  children?: ReactNode;
  notch?: string;
  className?: string;
}) {
  return (
    <article className={`paper overflow-hidden rounded-3xl shadow-ticket ${className}`} style={{ '--notch': notch } as CSSProperties}>
      <header className="flex items-center justify-between gap-4 bg-teal px-5 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink sm:px-8">
        <span>{kicker}</span>
        <span>Passport Stories</span>
      </header>

      <div className="flex items-end justify-between gap-2 px-5 pt-5 sm:px-8">
        <div className="min-w-0">
          <p className="kicker text-ink/70">From</p>
          <p className="h-display text-4xl text-ink sm:text-6xl">{from.code}</p>
          <p className="truncate text-sm font-semibold text-ink/80">{from.label}</p>
        </div>
        <FlightArc className="mb-5 min-w-0 flex-1" />
        <div className="min-w-0 text-right">
          <p className="kicker text-ink/70">To</p>
          <p className="h-display text-4xl text-ink sm:text-6xl">{to.code}</p>
          <p className="truncate text-sm font-semibold text-ink/80">{to.label}</p>
        </div>
      </div>

      {rows && (
        <dl className="grid grid-cols-2 gap-x-5 gap-y-5 px-5 py-6 sm:grid-cols-3 sm:px-8">
          {rows.map((r) => (
            <div key={r.label}>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink/70">{r.label}</dt>
              <dd className="mt-0.5 text-xl font-bold leading-tight text-ink sm:text-2xl">{r.value}</dd>
              {r.note && <dd className="mt-0.5 text-sm text-ink/75">{r.note}</dd>}
            </div>
          ))}
        </dl>
      )}

      {children && (
        <>
          <div className="perforation mt-2" />
          <div className="px-5 py-5 sm:px-8">{children}</div>
        </>
      )}
    </article>
  );
}
