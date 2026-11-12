import type { MetadataRoute } from 'next';
import { COUNTRIES, HOME_SLUG, pairSlug } from '@/data/countries';
import { site } from '@/data/site';
import { TOPICS } from '@/data/topics';
import { TOURS } from '@/data/tours';

/** /sitemap.xml: every page a search engine should know about. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '',
    '/explore',
    '/countries',
    '/your-life',
    '/tours',
    '/quiz',
    '/ask',
    '/about',
    '/passport',
    ...COUNTRIES.map((c) => `/countries/${c.slug}`),
    ...COUNTRIES.flatMap((c) => TOPICS.map((t) => `/countries/${c.slug}/${t.slug}`)),
    ...COUNTRIES.filter((c) => c.slug !== HOME_SLUG).map((c) => `/compare/${pairSlug(HOME_SLUG, c.slug)}`),
    ...COUNTRIES.filter((c) => c.slug !== HOME_SLUG).map((c) => `/your-life/${c.slug}`),
    ...TOURS.map((t) => `/tours/${t.slug}`),
  ];
  return paths.map((p) => ({ url: `${site.url}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }));
}
