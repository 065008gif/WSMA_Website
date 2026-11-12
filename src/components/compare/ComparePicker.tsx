'use client';

/** Two dropdowns that navigate to /compare/a-vs-b. */
import { useRouter } from 'next/navigation';

interface Option {
  slug: string;
  name: string;
  flag: string;
}

export default function ComparePicker({ options, a, b }: { options: Option[]; a: string; b: string }) {
  const router = useRouter();
  const go = (x: string, y: string) => {
    if (x !== y) router.push(`/compare/${x}-vs-${y}`);
  };
  const select = (label: string, value: string, other: string, onChange: (v: string) => void) => (
    <label className="flex-1">
      <span className="kicker mb-1 block text-cream/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border-2 border-cream/30 bg-night px-3 text-lg font-semibold text-cream"
      >
        {options.map((o) => (
          <option key={o.slug} value={o.slug} disabled={o.slug === other}>
            {o.flag} {o.name}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => e.preventDefault()} aria-label="Choose two countries to compare">
      {select('Country A', a, b, (v) => go(v, b))}
      <button type="button" onClick={() => go(b, a)} aria-label="Swap the two countries" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-cream/30 text-xl text-cream hover:border-sun">
        ⇄
      </button>
      {select('Country B', b, a, (v) => go(a, v))}
    </form>
  );
}
