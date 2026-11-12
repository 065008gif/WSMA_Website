/**
 * Google Analytics 4 helpers. Every custom event on the site goes through
 * `track()`, so ANALYTICS.md and this file are the two places to look.
 *
 * With no NEXT_PUBLIC_GA_ID set, nothing is sent; events are printed to the
 * browser console instead, which is handy for checking the tracking plan.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

/** The custom events in the tracking plan. */
export type EventName =
  | 'country_view'
  | 'topic_view'
  | 'compare_run'
  | 'your_life_generated'
  | 'share_card_downloaded'
  | 'quiz_completed'
  | 'suggestion_submitted'
  | 'stamp_earned'
  | 'teleport_used'
  | 'outbound_social_click'
  | 'search_used'
  | 'page_view';

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const UTM_STORE = 'ps_utm';
let initialised = false;

/** gtag expects the raw `arguments` object in the dataLayer, hence this shape. */
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function init() {
  if (initialised || !GA_ID) return;
  initialised = true;
  gtag('js', new Date());
  // Page views are sent by hand (see <Analytics />) so client-side
  // navigations are counted too.
  gtag('config', GA_ID, { send_page_view: false });
}

/**
 * Remember the UTM parameters the visitor landed with (for example from an
 * Instagram bio link). They are kept for the whole session and attached to
 * every event, so conversions can be attributed after the URL changes.
 */
export function captureUtm() {
  if (typeof window === 'undefined') return;
  const q = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  UTM_KEYS.forEach((k) => {
    const val = q.get(k);
    if (val) found[k] = val;
  });
  if (Object.keys(found).length) {
    try {
      sessionStorage.setItem(UTM_STORE, JSON.stringify(found));
    } catch {
      /* storage blocked: ignore */
    }
  }
}

export function getUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem(UTM_STORE) || '{}');
  } catch {
    return {};
  }
}

/** Send one event to GA4 (or log it when GA is not configured). */
export function track(event: EventName, params: Params = {}) {
  if (typeof window === 'undefined') return;
  const payload = { ...getUtm(), ...params };
  if (!GA_ID) {
    // eslint-disable-next-line no-console
    console.info(`[analytics] ${event}`, payload);
    return;
  }
  init();
  gtag('event', event, payload);
}

export function pageview(path: string) {
  track('page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
}

/** Adds UTM tags to links that leave for Instagram / YouTube. */
export function withUtm(url: string, content: string) {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'passportstories');
    u.searchParams.set('utm_medium', 'website');
    u.searchParams.set('utm_content', content);
    return u.toString();
  } catch {
    return url;
  }
}
