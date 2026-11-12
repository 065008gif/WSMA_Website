/**
 * The country registry. To add a country: copy an existing file in this
 * folder, edit it, then import it here and add it to COUNTRIES.
 */
import type { Country, Region } from '../types';
import { weekNumber } from '@/lib/week';
import india from './india';
import japan from './japan';
import southKorea from './south-korea';
import china from './china';
import singapore from './singapore';
import uae from './uae';
import germany from './germany';
import france from './france';
import italy from './italy';
import unitedKingdom from './united-kingdom';
import netherlands from './netherlands';
import sweden from './sweden';
import finland from './finland';
import usa from './usa';
import canada from './canada';
import brazil from './brazil';
import mexico from './mexico';
import australia from './australia';
import southAfrica from './south-africa';
import egypt from './egypt';

export const COUNTRIES: Country[] = [
  india, japan, southKorea, china, singapore, uae,
  germany, france, italy, unitedKingdom, netherlands, sweden, finland,
  usa, canada, brazil, mexico,
  australia, southAfrica, egypt,
];

export const HOME_SLUG = 'india';

export const REGIONS: Region[] = ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

const bySlug = new Map(COUNTRIES.map((c) => [c.slug, c]));
const byIso = new Map(COUNTRIES.map((c) => [c.isoNumeric, c]));

export const getCountry = (slug: string) => bySlug.get(slug);
export const getCountryByIso = (iso: string | number | undefined) =>
  iso === undefined ? undefined : byIso.get(String(iso).padStart(3, '0'));
export const INDIA = india;

/** Sunset accent colour for a country, cycled so neighbours differ. */
const ACCENTS = ['#FFB703', '#FB8500', '#F94144'];
export const accentOf = (c: Country) => ACCENTS[COUNTRIES.indexOf(c) % ACCENTS.length];

/** Country of the Week: pinned in site.ts, or rotating weekly (never India). */
export function countryOfTheWeek(date: Date, pinned: string | null): Country {
  if (pinned && bySlug.has(pinned)) return bySlug.get(pinned)!;
  const pool = COUNTRIES.filter((c) => c.slug !== HOME_SLUG);
  return pool[weekNumber(date) % pool.length];
}

/** Compare URLs look like /compare/india-vs-germany. */
export const pairSlug = (a: string, b: string) => `${a}-vs-${b}`;
export function parsePair(pair: string): [Country, Country] | null {
  const [a, b] = pair.split('-vs-');
  const ca = bySlug.get(a);
  const cb = bySlug.get(b);
  return ca && cb && ca !== cb ? [ca, cb] : null;
}
