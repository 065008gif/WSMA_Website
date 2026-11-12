import type { Metadata } from 'next';
import { COUNTRIES } from '@/data/countries';
import { toLite } from '@/data/countries/lite';
import { LAYERS, METRICS, formatMetric } from '@/data/topics';
import Breadcrumbs from '@/components/Breadcrumbs';
import ExploreClient, { type Layer } from '@/components/explore/ExploreClient';

export const metadata: Metadata = {
  title: 'Explore Map',
  description: 'Colour the world by working hours, school starting age, paid holidays, dinner time and more.',
};

// Light-to-dark sunset ramp: low values are pale, high values are deep red.
const RAMP = ['#FFF4E0', '#FFD66B', '#FFB703', '#FB8500', '#F94144'];

/** Work out colours, legend and ranking for one layer (5 equal-width bins). */
function buildLayer(key: (typeof LAYERS)[number]): Layer {
  const def = METRICS[key];
  const values = COUNTRIES.map((c) => c.metrics[key].value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / RAMP.length || 1;
  const bin = (v: number) => Math.min(RAMP.length - 1, Math.floor((v - min) / step));
  const round = (v: number) => (key === 'dinnerTime' ? Math.round(v * 2) / 2 : Math.round(v * 10) / 10);

  return {
    key,
    label: def.label,
    short: def.short,
    topicSlug: def.topic,
    plannedSource: def.plannedSource,
    colors: Object.fromEntries(COUNTRIES.map((c) => [c.slug, RAMP[bin(c.metrics[key].value)]])),
    displays: Object.fromEntries(COUNTRIES.map((c) => [c.slug, formatMetric(key, c.metrics[key].value)])),
    legend: RAMP.map((color, i) => ({
      color,
      label: `${formatMetric(key, round(min + i * step)).replace(/ [a-z/]+$/i, '')} to ${formatMetric(key, round(min + (i + 1) * step))}`,
    })),
    ranked: [...COUNTRIES].sort((a, b) => b.metrics[key].value - a.metrics[key].value).map((c) => c.slug),
    isSample: COUNTRIES.some((c) => c.metrics[key].isSample),
  };
}

export default function ExplorePage() {
  return (
    <>
      <div className="stars">
        <div className="container-x pb-3 pt-2">
          <Breadcrumbs items={[{ label: 'Explore Map' }]} />
          <h1 className="h-display mt-3 text-4xl sm:text-6xl">Explore Map</h1>
          <p className="mt-2 max-w-xl text-cream/85">Pick a layer and the world recolours itself. Tap a country for its number.</p>
        </div>
      </div>
      <ExploreClient countries={COUNTRIES.map(toLite)} layers={LAYERS.map(buildLayer)} />
    </>
  );
}
