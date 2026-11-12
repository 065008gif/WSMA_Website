/**
 * Loads the world map shapes (Natural Earth 110m, about 100 KB) once and
 * shares them between the 3D globe and the flat map.
 */
export interface WorldFeature {
  type: 'Feature';
  id: string;
  properties: { name: string };
  geometry: { type: 'Polygon'; coordinates: number[][][] } | { type: 'MultiPolygon'; coordinates: number[][][][] };
}

let cache: Promise<WorldFeature[]> | null = null;

export function loadWorld(): Promise<WorldFeature[]> {
  if (!cache) {
    cache = Promise.all([fetch('/data/countries-110m.json').then((r) => r.json()), import('topojson-client')]).then(
      ([topo, topojson]) => {
        const collection = topojson.feature(topo, topo.objects.countries) as unknown as { features: WorldFeature[] };
        // Drop Antarctica: it only adds a white smear at the bottom.
        return collection.features.filter((f) => f.id !== '010');
      },
    );
  }
  return cache;
}

/** True when the browser can draw WebGL at all. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Decide whether to start with the 3D globe or the lighter flat map.
 * Flat map for: reduced-motion users, data-saver mode, very low memory
 * phones, and browsers without WebGL. Visitors can always switch by hand.
 */
export function prefers3D(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory && nav.deviceMemory <= 2) return false;
  return hasWebGL();
}

/** Phones and older laptops get fewer arcs and a lower render resolution. */
export function isLowPower(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
}
