import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useGetCountriesQuery } from "@/api/countriesApi";
import { useGetFlagsQuery } from "@/api/flagsApi";
import {
  ALL_REGIONS,
  buildCountryToRegion,
  buildRegionOptions,
  getCountryRegion,
} from "@/lib/countries";

export const useCountrySearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    data: allCountries = [],
    isLoading: isLoadingCountries,
    error: countriesError,
    refetch: refetchCountries,
  } = useGetCountriesQuery();
  const { data: flagsData } = useGetFlagsQuery();

  const search = searchParams.get("search") ?? "";
  const activeRegion = searchParams.get("region") || ALL_REGIONS;

  const countryToRegion = useMemo(
    () => buildCountryToRegion(flagsData),
    [flagsData],
  );

  const regionOptions = useMemo(
    () => buildRegionOptions(allCountries, countryToRegion),
    [allCountries, countryToRegion],
  );

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allCountries.filter((country) => {
      const matchesSearch =
        !query ||
        country.name.toLowerCase().includes(query) ||
        country.slug.toLowerCase().includes(query);

      const matchesRegion =
        activeRegion === ALL_REGIONS ||
        getCountryRegion(countryToRegion, country.name) === activeRegion;

      return matchesSearch && matchesRegion;
    });
  }, [allCountries, search, activeRegion, countryToRegion]);

  const writeParams = (
    updates: { search?: string; region?: string },
    options: { replace?: boolean } = { replace: true },
  ) => {
    const nextParams = new URLSearchParams(searchParams);

    if (updates.search !== undefined) {
      const value = updates.search.trim();
      if (value) nextParams.set("search", value);
      else nextParams.delete("search");
    }

    if (updates.region !== undefined) {
      if (updates.region && updates.region !== ALL_REGIONS) {
        nextParams.set("region", updates.region);
      } else {
        nextParams.delete("region");
      }
    }

    // Searching from another route jumps to the country index and applies the
    // query there; on the index itself we only adjust the query string.
    const queryString = nextParams.toString();
    const target = `/${queryString ? `?${queryString}` : ""}`;

    if (pathname !== "/") {
      navigate(target);
      return;
    }

    setSearchParams(nextParams, options);
  };

  const setSearch = (value: string) => writeParams({ search: value });

  const clearSearch = () => writeParams({ search: "" });

  const selectRegion = (region: string) => writeParams({ region });

  const resetFilters = () => writeParams({ search: "", region: ALL_REGIONS });

  return {
    allCountries,
    filteredCountries,
    isLoadingCountries,
    countriesError,
    refetchCountries,
    countryToRegion,
    regionOptions,
    search,
    activeRegion,
    setSearch,
    clearSearch,
    selectRegion,
    resetFilters,
  };
};
