'use client';

/**
 * Small interactive pieces used across pages:
 * DidYouKnow, CountryVisit, TrackEvent, TeleportButton, ShareLink.
 */
import { useEffect, useState } from 'react';
import { type EventName, track } from '@/lib/analytics';
import { earnBadge, earnStamp, getPassport } from '@/lib/passport';
import { useBoard } from './FlightProvider';

/* ---------------------------- Did You Know? ---------------------------- */

export interface Fact {
  text: string;
  country?: string;
}

/** A surprising fact on a small card. Shuffles on tap. */
export function DidYouKnow({ facts, tone = 'sun' }: { facts: Fact[]; tone?: 'sun' | 'sky' }) {
  // Start on the first fact so server and browser render the same thing,
  // then jump to a random one once the page is interactive.
  const [i, setI] = useState(0);
  useEffect(() => setI(Math.floor(Math.random() * facts.length)), [facts.length]);
  const fact = facts[i % facts.length];
  if (!fact) return null;
  return (
    <aside className={`rounded-3xl p-5 text-ink sm:p-6 ${tone === 'sun' ? 'bg-sun' : 'bg-sky'}`} aria-label="Did you know?">
      <p className="kicker">Did you know?{fact.country ? ` · ${fact.country}` : ''}</p>
      <p className="mt-2 text-lg font-semibold leading-snug sm:text-xl" aria-live="polite">
        {fact.text}
      </p>
      {facts.length > 1 && (
        <button onClick={() => setI((n) => (n + 1) % facts.length)} className="mt-3 font-mono text-sm font-medium underline underline-offset-4">
          Another one →
        </button>
      )}
    </aside>
  );
}

/* --------------------------- Tracking helpers -------------------------- */

/** Put on a country page: records the view and awards the passport stamp. */
export function CountryVisit({ country }: { country: { slug: string; name: string; airport: string } }) {
  useEffect(() => {
    track('country_view', { country: country.slug });
    const t = window.setTimeout(() => earnStamp(country), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.slug]);
  return null;
}

/** Fires one analytics event when the page it sits on is opened. */
export function TrackEvent({ event, params, badge }: { event: EventName; params?: Record<string, string | number>; badge?: string }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    track(event, params);
    if (badge) {
      const t = window.setTimeout(() => earnBadge(badge), 1200);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key, badge]);
  return null;
}

/* ------------------------------ Teleport ------------------------------- */

export interface TeleportTarget {
  slug: string;
  name: string;
  airport: string;
}

/**
 * "Teleport me": jumps to a random country, preferring ones not yet stamped.
 * On the home page the globe listens for the `ps:teleport` event and spins
 * there first; elsewhere it goes straight to the boarding transition.
 */
export function TeleportButton({ countries, className = 'btn btn-ghost' }: { countries: TeleportTarget[]; className?: string }) {
  const board = useBoard();
  const go = () => {
    const stamps = getPassport().stamps;
    const fresh = countries.filter((c) => !stamps[c.slug]);
    const pool = fresh.length ? fresh : countries;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    track('teleport_used', { country: pick.slug });
    const detail = { slug: pick.slug, handled: false };
    window.dispatchEvent(new CustomEvent('ps:teleport', { detail }));
    if (!detail.handled) board(`/countries/${pick.slug}`, { name: pick.name, code: pick.airport });
  };
  return (
    <button onClick={go} className={className}>
      <span aria-hidden>🎲</span> Teleport me
    </button>
  );
}

/* ------------------------------ Share link ----------------------------- */

/** Shares the current page with the phone's share sheet, or copies the link. */
export function ShareLink({ title, className = 'btn btn-ghost-ink' }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href.split('?')[0];
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* share sheet dismissed */
    }
  };
  return (
    <button onClick={share} className={className}>
      <span aria-hidden>🔗</span> {copied ? 'Link copied' : 'Share this'}
    </button>
  );
}
