# Analytics tracking plan

Passport Stories uses **Google Analytics 4**. This file documents every event the site sends, when it fires, and which parameters go with it.

## Setup

1. In GA4, create a Web data stream and copy the Measurement ID (`G-XXXXXXXXXX`).
2. Set `NEXT_PUBLIC_GA_ID` in `.env.local` (local) and in Vercel > Project > Settings > Environment Variables (production). Redeploy.
3. Open the site and check GA4 > Reports > Realtime.

With no ID set, nothing is sent to Google. Every event is printed to the browser console as `[analytics] event_name {params}` instead, which is the quickest way to check the plan while developing.

**Where the code lives**

| File | Role |
|---|---|
| `src/lib/analytics.ts` | `track()`, page views, UTM capture. The only file that talks to GA. |
| `src/components/Analytics.tsx` | Loads gtag.js, captures UTMs on landing, sends `page_view` on each route change. |
| `src/components/Bits.tsx` | `<TrackEvent>` and `<CountryVisit>` helpers used by pages. |

## Custom events

| Event | Fires when | Parameters | Sent from |
|---|---|---|---|
| `country_view` | A country page is opened | `country` (slug) | `CountryVisit` in `Bits.tsx` |
| `topic_view` | A topic page is opened (e.g. Japan > School day) | `country`, `topic` | `countries/[slug]/[topic]/page.tsx` |
| `compare_run` | A comparison page is opened | `country_a`, `country_b`, `comparison_pair` (e.g. `india-vs-germany`) | `compare/[pair]/page.tsx` |
| `your_life_generated` | A Your Life result is generated, by the form or by "Try another country" | `country`, `work_hours`, `commute_minutes`, `salary_band`, `via` (`try_another` when applicable) | `YourLifeClient.tsx` |
| `share_card_downloaded` | A story card PNG is downloaded | `card_type` (`your_life` or `quiz`), `country` or `quiz_score` | `YourLifeClient.tsx`, `QuizClient.tsx` |
| `quiz_completed` | The fifth quiz round is finished | `quiz_score` (0 to 15), `max_score`, `correct_answers`, `best_streak` | `QuizClient.tsx` |
| `suggestion_submitted` | The Ask the Map form is submitted successfully | `suggestion_type` (`country` or `topic`), `suggestion` (first 60 characters), `delivered` (false in preview mode) | `AskForm.tsx` |
| `stamp_earned` | A country is visited for the first time in this browser | `country`, `stamps_total` | `lib/passport.ts` |
| `teleport_used` | "Teleport me" is pressed | `country` (the random pick) | `TeleportButton` in `Bits.tsx` |
| `outbound_social_click` | An Instagram or YouTube link is clicked | `platform`, `placement` (`footer` or `reels`) | `SocialLink` in `FooterClient.tsx` |

Two supporting events:

| Event | Fires when | Parameters |
|---|---|---|
| `page_view` | Every page load and client-side navigation | `page_path`, `page_location`, `page_title` |
| `search_used` | A search result is chosen | `search_term`, `result` (destination path) |

## UTM parameters

When a visitor lands with UTM tags (for example `?utm_source=instagram&utm_medium=bio&utm_campaign=launch`):

- GA4 reads them from the landing URL as usual for session attribution.
- The site also stores `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` and `utm_content` in `sessionStorage` and attaches them to **every custom event** for the rest of the session, so you can break down `your_life_generated` or `quiz_completed` by campaign even after the URL has changed.
- Links leaving for Instagram and YouTube are tagged `utm_source=passportstories&utm_medium=website&utm_content=<placement>`.

Suggested link tags for social posts:

| Placement | Example |
|---|---|
| Instagram bio | `?utm_source=instagram&utm_medium=bio` |
| Instagram story sticker | `?utm_source=instagram&utm_medium=story&utm_campaign=<country>` |
| YouTube description | `?utm_source=youtube&utm_medium=description&utm_campaign=<video>` |
| WhatsApp share | `?utm_source=whatsapp&utm_medium=share` |

## GA4 configuration checklist

Custom parameters only appear in reports after they are registered. In GA4 > Admin > Custom definitions, create **event-scoped custom dimensions** for:

`country`, `topic`, `comparison_pair`, `card_type`, `salary_band`, `suggestion_type`, `platform`, `placement`

and **custom metrics** for: `quiz_score`, `stamps_total`.

Mark these as **key events** (conversions): `your_life_generated`, `share_card_downloaded`, `quiz_completed`, `suggestion_submitted`, `outbound_social_click`.

## Questions the plan can answer

| Question | How |
|---|---|
| Which countries pull the most interest? | `country_view` by `country` |
| Which topic is most read? | `topic_view` by `topic` |
| Which comparisons do people run? | `compare_run` by `comparison_pair` |
| Does Instagram traffic use the signature feature? | `your_life_generated` filtered by `utm_source = instagram` |
| How shareable are the cards? | `share_card_downloaded` divided by `your_life_generated` + `quiz_completed` |
| Does the passport bring people back? | Returning users with `stamp_earned`, and the distribution of `stamps_total` |
| Does the site send people back to social? | `outbound_social_click` by `platform` and `placement` |

## Privacy notes

- Salary and rent are never sent. Only a broad `salary_band` (`under_25k`, `25k_50k`, `50k_100k`, `100k_200k`, `over_200k`) is recorded.
- Passport stamps and Your Life inputs stay in the visitor's browser (`localStorage`).
- If the site is promoted in regions that require consent for analytics cookies, add a consent banner before loading GA.
