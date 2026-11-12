'use client';

/**
 * The real-time 3D Earth (react-globe.gl on top of three.js).
 *
 * It is drawn as a stylised poster rather than a satellite photo: indigo
 * ocean, faint cream land, covered countries raised and glowing in sunset
 * colours. Using flat colours instead of image textures keeps it light
 * enough for phones.
 *
 * This file is only ever loaded in the browser, and only when needed
 * (see WorldStage.tsx), so three.js never slows down the first paint.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial } from 'three';
import type { CountryLite } from '@/data/countries/lite';
import type { WorldFeature } from './world';

export interface GlobeViewProps {
  features: WorldFeature[];
  countries: CountryLite[];
  /** Flight arcs start here (India). */
  home: CountryLite;
  width: number;
  height: number;
  colorOf: (c: CountryLite) => string;
  hoverSlug: string | null;
  onHover: (c: CountryLite | null) => void;
  onPick: (c: CountryLite) => void;
  /** When this changes the camera flies to the country. */
  focus: CountryLite | null;
  /** Country that gets a pulsing ring (Country of the Week). */
  ringSlug?: string;
  arcs: boolean;
  lowPower: boolean;
  /** Camera distance: smaller is closer. */
  altitude: number;
  wheelZoom: boolean;
}

// react-globe.gl passes each datum back as a plain object.
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function GlobeView(p: GlobeViewProps) {
  const ref = useRef<GlobeMethods | undefined>(undefined);
  const byIso = useMemo(() => new Map(p.countries.map((c) => [c.isoNumeric, c])), [p.countries]);
  const ocean = useMemo(() => new MeshPhongMaterial({ color: '#1B1F5E', emissive: '#0B0D33', shininess: 6 }), []);

  const setup = useCallback(() => {
    const globe = ref.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = p.wheelZoom;
    controls.minDistance = 150;
    controls.maxDistance = 520;
    // Cap the resolution: retina phones would otherwise draw 9x the pixels.
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio, p.lowPower ? 1.5 : 2));
    globe.pointOfView({ lat: p.home.geo.lat - 6, lng: p.home.geo.lng, altitude: p.altitude }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to a picked country and stop spinning so it stays in view.
  useEffect(() => {
    const globe = ref.current;
    if (!globe || !p.focus) return;
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: p.focus.geo.lat, lng: p.focus.geo.lng, altitude: Math.min(p.altitude, 1.5) }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.focus]);

  // Zoom buttons.
  useEffect(() => {
    ref.current?.pointOfView({ altitude: p.altitude }, 400);
  }, [p.altitude]);

  const countryOf = useCallback((f: any) => byIso.get(String(f.id)), [byIso]);

  const capColor = useCallback(
    (f: any) => {
      const c = countryOf(f);
      if (!c) return 'rgba(255,244,224,0.13)';
      return c.slug === p.hoverSlug ? '#FFF4E0' : p.colorOf(c);
    },
    [countryOf, p.hoverSlug, p.colorOf],
  );
  const altitudeOf = useCallback(
    (f: any) => {
      const c = countryOf(f);
      if (!c) return 0.005;
      return c.slug === p.hoverSlug ? 0.06 : 0.02;
    },
    [countryOf, p.hoverSlug],
  );

  const arcs = useMemo(() => {
    if (!p.arcs) return [];
    const others = p.countries.filter((c) => c.slug !== p.home.slug);
    return (p.lowPower ? others.filter((_, i) => i % 2 === 0) : others).map((c) => ({ from: p.home.geo, to: c.geo }));
  }, [p.arcs, p.countries, p.home, p.lowPower]);

  const rings = useMemo(() => p.countries.filter((c) => c.slug === p.ringSlug), [p.countries, p.ringSlug]);

  return (
    <Globe
      ref={ref}
      width={p.width}
      height={p.height}
      backgroundColor="rgba(0,0,0,0)"
      globeMaterial={ocean}
      showAtmosphere
      atmosphereColor="#4CC9F0"
      atmosphereAltitude={0.17}
      onGlobeReady={setup}
      // Country shapes
      polygonsData={p.features}
      polygonCapColor={capColor}
      polygonSideColor={() => 'rgba(13,15,58,0.55)'}
      polygonStrokeColor={() => 'rgba(255,244,224,0.28)'}
      polygonAltitude={altitudeOf}
      polygonsTransitionDuration={250}
      onPolygonHover={(f: any) => p.onHover(f ? (countryOf(f) ?? null) : null)}
      onPolygonClick={(f: any) => {
        const c = countryOf(f);
        if (c) p.onPick(c);
      }}
      // A marker on every covered country (also the only way to see Singapore)
      pointsData={p.countries}
      pointLat={(c: any) => c.geo.lat}
      pointLng={(c: any) => c.geo.lng}
      pointColor={() => '#FFF4E0'}
      pointAltitude={0.028}
      pointRadius={0.5}
      pointsMerge={false}
      onPointHover={(c: any) => p.onHover(c ?? null)}
      onPointClick={(c: any) => p.onPick(c)}
      // Pulsing ring on the Country of the Week
      ringsData={rings}
      ringLat={(c: any) => c.geo.lat}
      ringLng={(c: any) => c.geo.lng}
      ringColor={() => (t: number) => `rgba(255,183,3,${1 - t})`}
      ringMaxRadius={7}
      ringPropagationSpeed={2.5}
      ringRepeatPeriod={1100}
      // Dotted flight paths leaving India
      arcsData={arcs}
      arcStartLat={(a: any) => a.from.lat}
      arcStartLng={(a: any) => a.from.lng}
      arcEndLat={(a: any) => a.to.lat}
      arcEndLng={(a: any) => a.to.lng}
      arcColor={() => ['rgba(255,183,3,0.95)', 'rgba(249,65,68,0.95)']}
      arcStroke={0.32}
      arcDashLength={0.45}
      arcDashGap={0.3}
      arcDashAnimateTime={4200}
      arcAltitudeAutoScale={0.42}
    />
  );
}
