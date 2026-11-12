/**
 * Site-wide settings. This is the one file to edit for social links,
 * Reels embeds, the logo and the Country of the Week.
 */
export const site = {
  name: 'Passport Stories',
  tagline: 'Same planet. Different lives.',
  description:
    'Pick a country on the globe, see how people there work, study, marry, eat, live and commute, and compare it with India.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://passport-stories.vercel.app',

  /** Swap to '/logo.png' once the real badge is in /public. */
  logo: '/logo.svg',

  social: {
    instagram: 'https://www.instagram.com/passportstories',
    youtube: 'https://www.youtube.com/@passportstories',
    handle: '@passportstories',
  },

  /** Formspree form ID for Ask the Map (set NEXT_PUBLIC_FORMSPREE_ID). */
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID || '',

  /**
   * Country of the Week. Leave null to rotate automatically through all
   * countries by calendar week, or set a slug (e.g. 'japan') to pin one.
   */
  countryOfTheWeek: null as string | null,

  /**
   * Latest Reels / Shorts. Leave `youtubeId` empty to show a placeholder
   * tile; add a YouTube Shorts video ID to embed it. `href` is where the
   * tile links to (an Instagram Reel URL works here).
   */
  reels: [
    { title: 'A school day in Japan, start to finish', platform: 'Instagram', youtubeId: '', href: '' },
    { title: 'India vs Germany: who leaves work first?', platform: 'YouTube', youtubeId: '', href: '' },
    { title: 'Three weddings, three continents', platform: 'Instagram', youtubeId: '', href: '' },
    { title: 'How Amsterdam cycles to work', platform: 'YouTube', youtubeId: '', href: '' },
  ],

  /** Shown on the About page. Replace with the real team. */
  team: 'A small student team curious about how the rest of the world spends an ordinary Tuesday.',
};

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore Map' },
  { href: '/countries', label: 'Countries' },
  { href: '/compare', label: 'Compare' },
  { href: '/your-life', label: 'Your Life' },
  { href: '/tours', label: 'Theme Tours' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/about', label: 'About' },
];
