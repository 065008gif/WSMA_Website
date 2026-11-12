import type { Config } from 'tailwindcss';

// Brand palette from the Passport Stories badge. Use these names everywhere
// (bg-ink, text-cream, ...) instead of raw hex values.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B1F5E', // deep indigo: base, ring, dark surfaces
        night: '#0D0F3A', // darker shade of ink for the page background
        sun: '#FFB703',
        tang: '#FB8500',
        coral: '#F94144',
        cream: '#FFF4E0',
        teal: '#06A77D',
        sky: '#4CC9F0',
      },
      fontFamily: {
        display: ['"Bowlby One"', 'Impact', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        ticket: '0 18px 40px -18px rgba(0,0,0,.55)',
      },
    },
  },
  plugins: [],
};
export default config;
