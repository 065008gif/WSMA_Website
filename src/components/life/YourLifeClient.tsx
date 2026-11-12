'use client';

/**
 * Your Life in Another Country (the signature feature).
 *
 * Flow: fill in the check-in form -> we save the numbers in this browser
 * (never on a server) -> /your-life/<country> shows the result as a
 * boarding pass -> one tap to try another country or download a story card.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { track } from '@/lib/analytics';
import { earnBadge } from '@/lib/passport';
import { downloadStoryCard } from '@/lib/shareCard';
import { type LifeCountry, type LifeInputs, computeLife, loadInputs, money, rupees, saveInputs } from '@/lib/yourLife';
import BoardingPass from '../BoardingPass';

const FIELD = 'h-12 w-full rounded-xl border-2 border-ink/25 bg-white/70 px-3 text-lg font-semibold text-ink placeholder:font-normal placeholder:text-ink/45 focus:border-ink';

/** Salary is never sent to analytics, only a broad band. */
const salaryBand = (s: number) => (s < 25000 ? 'under_25k' : s < 50000 ? '25k_50k' : s < 100000 ? '50k_100k' : s < 200000 ? '100k_200k' : 'over_200k');

export default function YourLifeClient({ countries, slug }: { countries: LifeCountry[]; slug?: string }) {
  const router = useRouter();
  const home = countries.find((c) => c.slug === 'india')!;
  const options = countries.filter((c) => c.slug !== 'india');
  const target = options.find((c) => c.slug === slug);

  const [form, setForm] = useState({ salary: '', rent: '', hours: '45', commute: '60', city: '' });
  const [dest, setDest] = useState(slug || 'germany');
  const [saved, setSaved] = useState<LifeInputs | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Bring back the numbers from last time.
  useEffect(() => {
    const i = loadInputs();
    if (!i) return;
    setSaved(i);
    setForm({ salary: String(i.salary), rent: String(i.rent), hours: String(i.hours), commute: String(i.commute), city: i.city });
  }, []);

  const result = target && saved && !editing ? computeLife(saved, target, home) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputs: LifeInputs = {
      salary: Number(form.salary),
      rent: Number(form.rent),
      hours: Number(form.hours),
      commute: Number(form.commute),
      city: form.city.trim() || 'India',
    };
    if (!(inputs.salary > 0)) return setError('Enter your monthly salary in rupees.');
    if (!(inputs.rent >= 0) || form.rent === '') return setError('Enter your monthly rent (0 if you do not pay rent).');
    if (!(inputs.hours > 0 && inputs.hours <= 100)) return setError('Weekly work hours should be between 1 and 100.');
    if (!(inputs.commute >= 0 && inputs.commute <= 600) || form.commute === '') return setError('Daily commute should be between 0 and 600 minutes.');
    setError('');
    saveInputs(inputs);
    setSaved(inputs);
    setEditing(false);
    track('your_life_generated', { country: dest, work_hours: inputs.hours, commute_minutes: inputs.commute, salary_band: salaryBand(inputs.salary) });
    earnBadge('parallel-life');
    if (dest !== slug) router.push(`/your-life/${dest}`);
  };

  const tryAnother = () => {
    const others = options.filter((c) => c.slug !== slug);
    const next = others[Math.floor(Math.random() * others.length)];
    track('your_life_generated', { country: next.slug, work_hours: saved?.hours, commute_minutes: saved?.commute, salary_band: salaryBand(saved?.salary || 0), via: 'try_another' });
    router.push(`/your-life/${next.slug}`);
  };

  /* ------------------------------ Result ------------------------------ */
  if (result && saved) {
    const c = result.country;
    const sym = c.life.currencySymbol;
    const hoursDiff = result.hoursNow - result.hoursThere;
    const signed = (n: number, unit: string) => (n === 0 ? `same as now` : `${Math.abs(n)} ${unit} ${n > 0 ? 'fewer' : 'more'} than now`);
    const rows = [
      {
        label: 'Salary to live the same',
        value: `${money(result.matchedSalary, sym)}/mo`,
        note: `Your ${rupees(saved.salary)} converts to ${money(result.convertedSalary, sym)}; prices differ`,
      },
      { label: 'Rent as share of pay', value: `${Math.round(result.rentShareThere)}%`, note: `You pay ${Math.round(result.rentShareNow)}% now` },
      { label: 'Work week', value: `${result.hoursThere} hrs`, note: signed(hoursDiff, 'hrs') },
      { label: 'Paid holidays', value: `${result.holidaysThere} days/yr`, note: `India: ${result.holidaysNow} days` },
      { label: 'Typical commute', value: `${result.commuteThere} min/day`, note: `You: ${result.commuteNow} min/day` },
      {
        label: 'Free time',
        value: `${result.freeHoursPerYear >= 0 ? '+' : '−'}${Math.abs(result.freeHoursPerYear)} hrs/yr`,
        note: 'work and commute combined',
      },
    ];

    const download = async () => {
      setBusy(true);
      await downloadStoryCard({
        filename: `my-life-in-${c.slug}.png`,
        kicker: `From ${saved.city}`,
        title: `My life in ${c.name}`,
        from: 'YOU',
        to: c.airport,
        rows: rows.slice(0, 5).map((r) => ({ label: r.label, value: r.value })),
        quote: result.weekend,
      });
      track('share_card_downloaded', { card_type: 'your_life', country: c.slug });
      setBusy(false);
    };

    return (
      <div className="mx-auto max-w-3xl">
        <motion.div key={c.slug} initial={{ y: -50, opacity: 0, rotate: -2 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 16 }}>
          <BoardingPass kicker="Your life abroad" from={{ code: 'YOU', label: `${saved.city}, India` }} to={{ code: c.airport, label: `${c.flag} ${c.name}` }} rows={rows}>
            <p className="kicker text-ink/70">Your weekend could look like</p>
            <p className="mt-1 text-lg font-semibold italic leading-snug text-ink">“{result.weekend}”</p>
            {result.usesSampleData && (
              <p className="mt-3 text-sm text-ink/75">
                <span className="sample-tag ml-0 mr-1">sample</span>
                These results use sample cost-of-living and exchange figures that are still being verified. Treat them as a conversation starter, not
                financial advice.
              </p>
            )}
          </BoardingPass>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={download} disabled={busy} className="btn btn-sun">
            <span aria-hidden>⬇</span> {busy ? 'Printing…' : 'Download story card'}
          </button>
          <button onClick={tryAnother} className="btn btn-ghost">
            <span aria-hidden>🎲</span> Try another country
          </button>
          <button onClick={() => setEditing(true)} className="btn btn-ghost">
            Edit my numbers
          </button>
        </div>

        <div className="mt-8">
          <p className="kicker text-sun">Or pick a destination</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {options.map((o) => (
              <li key={o.slug}>
                <Link href={`/your-life/${o.slug}`} className="chip text-cream" aria-current={o.slug === slug ? 'true' : undefined}>
                  {o.flag} {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-cream/85">
          Curious why?{' '}
          <Link href={`/countries/${c.slug}`} className="font-semibold text-sun underline underline-offset-4">
            See everyday life in {c.name} →
          </Link>
        </p>
      </div>
    );
  }

  /* ------------------------------- Form ------------------------------- */
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="paper mx-auto max-w-3xl overflow-hidden rounded-3xl shadow-ticket" noValidate>
      <p className="flex justify-between bg-teal px-5 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink sm:px-8">
        <span>Check-in desk</span>
        <span>Step 1 of 1</span>
      </p>
      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
        <label>
          <span className="mb-1 block font-semibold">Monthly salary (₹)</span>
          <input className={FIELD} inputMode="numeric" type="number" min="0" placeholder="60000" value={form.salary} onChange={set('salary')} required />
        </label>
        <label>
          <span className="mb-1 block font-semibold">Monthly rent (₹)</span>
          <input className={FIELD} inputMode="numeric" type="number" min="0" placeholder="18000" value={form.rent} onChange={set('rent')} required />
        </label>
        <label>
          <span className="mb-1 block font-semibold">Work hours per week</span>
          <input className={FIELD} inputMode="numeric" type="number" min="1" max="100" value={form.hours} onChange={set('hours')} required />
        </label>
        <label>
          <span className="mb-1 block font-semibold">Daily commute, both ways (minutes)</span>
          <input className={FIELD} inputMode="numeric" type="number" min="0" max="600" value={form.commute} onChange={set('commute')} required />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block font-semibold">Home city</span>
          <input className={FIELD} type="text" autoComplete="address-level2" placeholder="Delhi" value={form.city} onChange={set('city')} maxLength={30} />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 font-semibold">Where to?</legend>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <button
                key={o.slug}
                type="button"
                onClick={() => setDest(o.slug)}
                aria-pressed={dest === o.slug}
                className={`min-h-[44px] rounded-full border-2 px-3 py-1.5 text-sm font-semibold ${dest === o.slug ? 'border-ink bg-ink text-cream' : 'border-ink/25 text-ink hover:border-ink'}`}
              >
                {o.flag} {o.name}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="perforation" style={{ ['--notch' as string]: '#0D0F3A' }} />
      <div className="flex flex-wrap items-center gap-4 p-5 sm:px-8">
        <button type="submit" className="btn btn-ink">
          Print my boarding pass →
        </button>
        <p role="alert" className="font-semibold text-[#B3261E]">
          {error}
        </p>
        <p className="basis-full text-sm text-ink/75">Your numbers stay in this browser. Nothing is uploaded.</p>
      </div>
    </form>
  );
}
