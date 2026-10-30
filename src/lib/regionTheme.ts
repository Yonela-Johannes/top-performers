import { REGION_ORDER } from "./countries";

/**
 * One fixed region-to-token mapping. Colour never carries meaning alone:
 * every region label is also shown as text next to its swatch.
 * All values reference existing CSS custom properties from index.css.
 */
export interface RegionTheme {
  /** Fill for swatches/stamps (CSS var reference). */
  fill: string;
  /** Ink for the small route waypoint next to a region. */
  waypoint: string;
}

const REGION_THEMES: Record<string, RegionTheme> = {
  Africa: { fill: "var(--sun)", waypoint: "var(--tangerine)" },
  Americas: { fill: "var(--mint)", waypoint: "var(--green)" },
  Asia: { fill: "var(--pink)", waypoint: "var(--tangerine)" },
  Europe: { fill: "var(--sky)", waypoint: "var(--violet)" },
  Oceania: { fill: "var(--lilac)", waypoint: "var(--violet)" },
};

const FALLBACK: RegionTheme = {
  fill: "var(--surface-muted)",
  waypoint: "var(--ink-secondary)",
};

export const regionTheme = (region?: string): RegionTheme =>
  (region && REGION_THEMES[region]) || FALLBACK;

/** Region names in atlas order, for deterministic "More in <Region>" lists. */
export const REGION_NAMES = [...REGION_ORDER];
