'use client';

/**
 * The lighter alternative to the 3D globe: a flat SVG world map with the
 * same colours and the same click behaviour. Used for reduced-motion
 * visitors, data-saver mode, low-end phones and browsers without WebGL.
 * Covered countries are real buttons, so it also works by keyboard.
 */
import { useMemo } from 'react';
import type { CountryLite } from '@/data/countries/lite';
import type { WorldFeature } from './world';

const W = 1000;
const H = 500;
const project = (lng: number, lat: number) => [((lng + 180) / 360) * W, ((90 - lat) / 180) * H];

/** Turn one outline ring into an SVG path (simple equirectangular projection). */
function ringPath(ring: number[][]) {
  // Shapes that cross the date line (far-east Russia, Fiji) would draw a line
  // across the whole map; shifting their western half east avoids that.
  let crosses = false;
  for (let i = 1; i < ring.length; i++) if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) crosses = true;
  return (
    ring
      .map(([lng, lat], i) => {
        const [x, y] = project(crosses && lng < 0 ? lng + 360 : lng, lat);
        return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join('') + 'Z'
  );
}

function featurePath(f: WorldFeature) {
  const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  return polygons.map((poly) => poly.map(ringPath).join('')).join('');
}

export default function FlatMap({
  features,
  countries,
  colorOf,
  hoverSlug,
  onHover,
  onPick,
}: {
  features: WorldFeature[];
  countries: CountryLite[];
  colorOf: (c: CountryLite) => string;
  hoverSlug: string | null;
  onHover: (c: CountryLite | null) => void;
  onPick: (c: CountryLite) => void;
}) {
  const byIso = useMemo(() => new Map(countries.map((c) => [c.isoNumeric, c])), [countries]);
  const shapes = useMemo(() => features.map((f) => ({ id: f.id, d: featurePath(f), country: byIso.get(String(f.id)) })), [features, byIso]);

  const interactive = (c: CountryLite) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': `${c.name}: open country page`,
    onClick: () => onPick(c),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPick(c);
      }
    },
    onPointerEnter: () => onHover(c),
    onPointerLeave: () => onHover(null),
    onFocus: () => onHover(c),
    onBlur: () => onHover(null),
    style: { cursor: 'pointer' },
  });

  return (
    <svg viewBox={`0 28 ${W} 400`} className="h-full w-full" role="group" aria-label="World map of covered countries">
      {/* Land that is not covered yet */}
      {shapes
        .filter((s) => !s.country)
        .map((s) => (
          <path key={s.id + s.d.length} d={s.d} fill="rgba(255,244,224,0.14)" stroke="rgba(255,244,224,0.25)" strokeWidth="0.5" />
        ))}
      {/* Covered countries */}
      {shapes.map(
        (s) =>
          s.country && (
            <path
              key={s.id}
              d={s.d}
              fill={s.country.slug === hoverSlug ? '#FFF4E0' : colorOf(s.country)}
              stroke="#0D0F3A"
              strokeWidth="0.8"
              {...interactive(s.country)}
            />
          ),
      )}
      {/* Markers, so small countries such as Singapore can be tapped */}
      {countries.map((c) => {
        const [x, y] = project(c.geo.lng, c.geo.lat);
        return (
          <g key={c.slug} {...interactive(c)}>
            <circle cx={x} cy={y} r="11" fill="transparent" />
            <circle cx={x} cy={y} r={c.slug === hoverSlug ? 6 : 3.6} fill="#FFF4E0" stroke="#0D0F3A" strokeWidth="1.2" />
          </g>
        );
      })}
    </svg>
  );
}
