import type { Country } from "@/api/countriesApi";
import type { FlagData } from "@/api/flagsApi";

export const REGION_ORDER = [
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
  "Other",
] as const;

export const ALL_REGIONS = "All";

export interface RegionOption {
  name: string;
  count: number;
}

export const buildCountryToRegion = (
  flags: FlagData[] | undefined,
): Record<string, string> => {
  const map: Record<string, string> = {};
  if (Array.isArray(flags)) {
    flags.forEach((item) => {
      if (item.name && item.continent) {
        map[item.name.toLowerCase()] = item.continent;
      }
    });
  }
  return map;
};

export const getCountryRegion = (
  countryToRegion: Record<string, string>,
  countryName: string,
): string => countryToRegion[countryName.toLowerCase()] || "Other";

export const buildRegionOptions = (
  countries: Country[],
  countryToRegion: Record<string, string>,
): RegionOption[] => {
  const counts = new Map<string, number>();
  countries.forEach((country) => {
    const region = getCountryRegion(countryToRegion, country.name);
    counts.set(region, (counts.get(region) || 0) + 1);
  });

  return REGION_ORDER.filter((region) => counts.has(region)).map((region) => ({
    name: region,
    count: counts.get(region) || 0,
  }));
};
