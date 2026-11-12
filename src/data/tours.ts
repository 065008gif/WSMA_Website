import type { MetricKey, TopicSlug } from './types';

/**
 * Theme Tours follow one topic across several countries. Each stop reuses the
 * country's own topic copy, so a tour only needs a title, intro and stop list.
 */
export interface Tour {
  slug: string;
  title: string;
  kicker: string;
  intro: string;
  outro: string;
  topic: TopicSlug;
  /** The number shown large at every stop. */
  metric: MetricKey;
  /** Country slugs in flight order. */
  stops: string[];
}

export const TOURS: Tour[] = [
  {
    slug: 'school-days',
    title: 'School Days Around the World',
    kicker: 'Tour 01',
    intro: 'The bell rings everywhere. What happens before and after it is where things get interesting.',
    outro: 'Eight classrooms, eight ordinary mornings. Same subjects, mostly. Very different days.',
    topic: 'school-day',
    metric: 'schoolStartAge',
    stops: ['india', 'japan', 'finland', 'south-korea', 'germany', 'france', 'usa', 'brazil'],
  },
  {
    slug: 'weddings',
    title: 'Weddings Around the World',
    kicker: 'Tour 02',
    intro: 'Two people, one promise, and a guest list that ranges from sixty to six hundred.',
    outro: 'Different clothes, different music, the same nervous smile at the start.',
    topic: 'weddings',
    metric: 'weddingGuests',
    stops: ['india', 'japan', 'germany', 'egypt', 'mexico', 'south-korea', 'italy', 'south-africa'],
  },
  {
    slug: 'getting-to-work',
    title: 'How the World Gets to Work',
    kicker: 'Tour 03',
    intro: 'Somewhere right now a train is leaving on the second, and somewhere else an auto is negotiating.',
    outro: 'However people get there, everyone is checking the time.',
    topic: 'transport',
    metric: 'commuteMinutes',
    stops: ['india', 'japan', 'netherlands', 'germany', 'usa', 'singapore', 'brazil', 'uae'],
  },
  {
    slug: 'home-life',
    title: 'Home Life',
    kicker: 'Tour 04',
    intro: 'Who lives behind the front door, and who is expected to move out, changes from country to country.',
    outro: 'A home is a floor plan plus a set of habits. The habits travel worst.',
    topic: 'housing',
    metric: 'householdSize',
    stops: ['india', 'japan', 'italy', 'sweden', 'usa', 'uae', 'china', 'australia'],
  },
];

export const getTour = (slug: string) => TOURS.find((t) => t.slug === slug);
