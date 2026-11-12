# Passport Stories

**Same planet. Different lives.**

An interactive website about how people in different countries live everyday life: work, school, weddings, food, housing and transport. Visitors pick a country on a 3D globe, compare it with India, and see what their own life could look like abroad.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion and react-globe.gl. It deploys on Vercel's free plan and uses no paid services or APIs.

> **Read this first: the numbers are sample data.**
> Every statistic on the site (working hours, paid leave, cost-of-living index, exchange rates and so on) is a **sample value** marked `isSample: true` in the data files and tagged "sample" in the interface. They are realistic placeholders, not verified facts. Replace them with World Bank, OECD and cost-of-living data before quoting them anywhere. The written copy is an editorial draft and should also be reviewed. India, Japan and Germany have full-length copy; the other 17 countries have complete but shorter entries.

## What is in the box

| Feature | Route | Notes |
|---|---|---|
| Home with interactive 3D globe | `/` | Flight arcs from India, Country of the Week, departures board, Reels |
| Explore Map | `/explore` | 7 topic layers with legend and ranked list |
| Countries | `/countries`, `/countries/japan`, `/countries/japan/school-day` | 20 countries x 6 topics, each with a "Compared with India" box |
| Compare | `/compare/india-vs-germany` | Any two countries, animated bars, three biggest differences. `/compare` opens India vs Japan |
| Your Life in Another Country | `/your-life`, `/your-life/germany` | Boarding-pass result, 1080x1920 story card download |
| Theme Tours | `/tours`, `/tours/weddings` | Four scroll-driven stories |
| Guess the Country quiz | `/quiz` | Scoring, streaks, shareable score card |
| Your Passport | `/passport` | Stamps and badges in `localStorage`, no login |
| Ask the Map | `/ask` | Formspree form |
| About and Sources | `/about` | |

Also included: site-wide fuzzy search (Ctrl/Cmd + K or `/`), "Teleport me", "Did you know?" cards, breadcrumbs with structured data, Open Graph images, sitemap, optional stamp sound (off by default) and one hidden badge.

## Run it locally

You need Node.js 18.18 or newer.

```bash
npm install
cp .env.example .env.local   # optional: add your GA4 ID and Formspree ID
npm run dev
```

Open http://localhost:3000. Other commands: `npm run build` (production build), `npm run start` (serve the build), `npm run typecheck`.

## Deploy on Vercel, step by step

1. Create a new empty repository on GitHub.
2. In this folder:
   ```bash
   git init
   git add .
   git commit -m "Passport Stories"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. Go to https://vercel.com/new, sign in with GitHub and **Import** the repository.
4. Vercel detects Next.js by itself. Leave the build settings alone.
5. Open **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_GA_ID` | Your GA4 Measurement ID, e.g. `G-ABC123XYZ` |
   | `NEXT_PUBLIC_FORMSPREE_ID` | Your Formspree form ID |
   | `NEXT_PUBLIC_SITE_URL` | The final site address, e.g. `https://passport-stories.vercel.app` |
6. Press **Deploy**. Every later `git push` redeploys automatically.

If you add or change an environment variable later, redeploy for it to take effect.

## Where to plug things in

| What | Where |
|---|---|
| GA4 Measurement ID | `NEXT_PUBLIC_GA_ID` environment variable. Details in [ANALYTICS.md](./ANALYTICS.md) |
| Ask the Map form | Create a free form at https://formspree.io, copy the ID from its URL (`https://formspree.io/f/abcdwxyz` gives `abcdwxyz`) into `NEXT_PUBLIC_FORMSPREE_ID`. Without it the form runs in preview mode and sends nothing |
| Instagram and YouTube links | `social` in `src/data/site.ts` |
| Reels and Shorts | `reels` in `src/data/site.ts`. Add a YouTube video ID to `youtubeId` to embed it; empty entries show a placeholder tile |
| Logo | Put the real badge at `public/logo.png`, then set `logo: '/logo.png'` in `src/data/site.ts`. Until then a placeholder SVG badge is used |
| Country of the Week | Rotates automatically every week. To pin one, set `countryOfTheWeek: 'japan'` in `src/data/site.ts` |
| Team description on About | `team` in `src/data/site.ts` |

## Editing content

All content lives in `src/data/`. Components never contain country text, so content can be edited without touching the interface.

```
src/data/
  types.ts            the schema (start here)
  helpers.ts          s() for sample numbers, v() for verified ones
  topics.ts           the 6 topics, the metric definitions, map layers
  tours.ts            the 4 theme tours
  site.ts             links, reels, logo, Country of the Week
  countries/
    index.ts          the list of countries
    india.ts ...      one file per country
```

### Edit a country

Open its file, for example `src/data/countries/japan.ts`, and change the text or numbers. Each of the six topics has a `headline`, `summary`, `highlights`, `vsIndia` (the "Compared with India" text) and `sources`. Adding a `story` array of paragraphs turns a short entry into a full-length page (see `india.ts`).

### Replace a sample number with a verified one

```ts
// before
workHours: s(34),
// after
workHours: v(34.3, 'OECD, average usual weekly hours, 2024'),
```

`v()` removes the "sample" tag for that figure everywhere it appears. The About page counts how many sample figures remain.

### Add a country

1. Copy an existing file in `src/data/countries/` and rename it, for example `vietnam.ts`.
2. Fill in every field. `isoNumeric` is the country's ISO 3166-1 numeric code as three characters (Vietnam is `'704'`); it links the country to its shape on the map. `geo` is where the marker sits.
3. Import it in `src/data/countries/index.ts` and add it to the `COUNTRIES` array.

Pages, compare combinations, search, the quiz, the sitemap and the map pick it up automatically. Two places hard-code the number 20 and need a manual update: the passport counter in `src/components/Header.tsx` and the stamp text in `src/lib/passport.ts`.

### Add a theme tour

Add an entry to `TOURS` in `src/data/tours.ts` with a topic, a metric and a list of country slugs. Each stop reuses that country's copy for the topic.

## Project structure

```
src/
  app/                 routes (one folder per URL)
  components/
    globe/             3D globe, flat map fallback, WorldStage wrapper
    home/ explore/ compare/ life/ tours/ quiz/ ask/ passport/
    BoardingPass.tsx   the ticket card used across the site
    FlightProvider.tsx the "Now boarding" page transition
    Stamp.tsx, StampToast.tsx
    Header.tsx, Footer.tsx, Breadcrumbs.tsx, SearchPalette.tsx
  data/                all content (see above)
  lib/
    analytics.ts       GA4 events and UTM handling
    passport.ts        stamps and badges (localStorage)
    yourLife.ts        the Your Life calculation
    shareCard.ts       draws the 1080x1920 story cards on a canvas
    og.tsx             Open Graph image layout
public/
  data/countries-110m.json   world map shapes (Natural Earth, public domain)
  logo.svg                   placeholder badge
assets/fonts/                font used by the Open Graph images
```

## How the Your Life numbers are calculated

See `src/lib/yourLife.ts`. In short:

- **Salary to live the same** = your salary x (destination cost index / India cost index) x exchange rate.
- **Rent as share of pay** compares your rent/salary with the destination's typical share.
- **Free time** = (your weekly hours minus theirs, plus the commute difference over 5 days) x 48 working weeks.

It is a simple, transparent model meant to start a conversation. It is not financial advice, and it currently runs on sample figures.

## Performance and accessibility

- The 3D code (three.js) is loaded only in the browser, only on pages with a map, after the rest of the page is interactive.
- The globe uses flat colours rather than image textures, caps its render resolution on phones and draws fewer flight arcs on low-power devices.
- Visitors with reduced-motion or data-saver settings, very low-memory devices or no WebGL get a flat SVG map with the same interactions. Anyone can switch between 3D and flat with the button on the map.
- Fonts are self-hosted through Fontsource, so there is no request to Google Fonts.
- All pages are statically generated. Comparison and Your Life share images are generated on first request and cached.
- Keyboard: skip link, visible focus rings, a departures board as the non-3D route to every country, a keyboard-operable flat map, and search from anywhere.
- Lighthouse has not been run on a deployed copy yet. Run it against the Vercel URL after the first deploy and treat 90+ as the target.

## Known limitations

- Statistics are sample values and country copy is draft (see the note at the top).
- Singapore is too small to appear as a shape in the lightweight map file, so it is shown as a marker.
- Flag emoji do not render on Windows desktop browsers, which show two-letter codes instead.
- The story card download saves a PNG; sharing straight into Instagram from the browser is not possible, so visitors upload it from their gallery.

## Licences

Map data: Natural Earth via world-atlas (public domain). Fonts: Bowlby One, DM Sans, DM Mono (SIL Open Font License).
