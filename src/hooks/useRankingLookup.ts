import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetCountriesQuery } from "@/api/countriesApi";
import { useGetCountryUsersQuery } from "@/api/committersApi";
import type { Committer } from "@/types";

const BATCH_SIZE = 8;
/** Country files are ~100–500 KB; the whole index is small enough to scan. */
const MAX_COUNTRIES = 250;

export interface RankingHit {
  committer: Committer;
  countrySlug: string;
  countryName: string;
  flagUrl?: string;
}

export interface RankingLookupState {
  /** The developer's entry in the commit index, if the scan found it. */
  ranking: RankingHit | null;
  /** A scan is in progress. */
  isLookingUp: boolean;
  /** Every indexed country has been checked and the handle is absent. */
  notRanked: boolean;
}

const cache = new Map<string, RankingHit | null>();

interface Options {
  username: string;
  /** Prefer the country the visitor arrived from. */
  preferredSlug?: string;
  enabled?: boolean;
}

export const useRankingLookup = ({
  username,
  preferredSlug,
  enabled = true,
}: Options): RankingHit | null => {
  const state = useRankingLookupState({ username, preferredSlug, enabled });
  return state.ranking;
};

/**
 * Same scan, plus its progress — for pages that want to say "checking the
 * index" rather than showing an empty ranking card.
 */
export const useRankingLookupState = ({
  username,
  preferredSlug,
  enabled = true,
}: Options): RankingLookupState => {
  const key = username.trim().toLowerCase();
  const { data: countries = [], isLoading: isLoadingCountries } =
    useGetCountriesQuery();

  const ordered = useMemo(() => {
    const capped = countries.slice(0, MAX_COUNTRIES);
    if (!preferredSlug) return capped;
    const preferred = capped.filter((c) => c.slug === preferredSlug);
    return [...preferred, ...capped.filter((c) => c.slug !== preferredSlug)];
  }, [countries, preferredSlug]);

  const [batch, setBatch] = useState(0);
  const [hit, setHit] = useState<RankingHit | null>(
    () => cache.get(key) ?? null,
  );
  const [exhausted, setExhausted] = useState(
    () => key !== "" && cache.get(key) === null,
  );

  // A different handle starts a fresh scan; the previous result is not reused.
  useEffect(() => {
    setHit(cache.get(key) ?? null);
    setExhausted(key !== "" && cache.get(key) === null);
    setBatch(0);
  }, [key]);

  const start = batch * BATCH_SIZE;
  const slice = ordered.slice(start, start + BATCH_SIZE);

  const [c0, c1, c2, c3, c4, c5, c6, c7] = [0, 1, 2, 3, 4, 5, 6, 7].map(
    (index) => slice[index],
  );

  const active = enabled && key !== "" && !hit && !exhausted;

  const q0 = useGetCountryUsersQuery(
    active && c0 ? { country: c0.slug, mode: "all" } : skipToken,
  );
  const q1 = useGetCountryUsersQuery(
    active && c1 ? { country: c1.slug, mode: "all" } : skipToken,
  );
  const q2 = useGetCountryUsersQuery(
    active && c2 ? { country: c2.slug, mode: "all" } : skipToken,
  );
  const q3 = useGetCountryUsersQuery(
    active && c3 ? { country: c3.slug, mode: "all" } : skipToken,
  );
  const q4 = useGetCountryUsersQuery(
    active && c4 ? { country: c4.slug, mode: "all" } : skipToken,
  );
  const q5 = useGetCountryUsersQuery(
    active && c5 ? { country: c5.slug, mode: "all" } : skipToken,
  );
  const q6 = useGetCountryUsersQuery(
    active && c6 ? { country: c6.slug, mode: "all" } : skipToken,
  );
  const q7 = useGetCountryUsersQuery(
    active && c7 ? { country: c7.slug, mode: "all" } : skipToken,
  );

  const results = [q0, q1, q2, q3, q4, q5, q6, q7];
  const batchLoading = results
    .slice(0, slice.length)
    .some((result) => result.isLoading);

  const blocked = results
    .slice(0, slice.length)
    .some((result) => result.isFetching && !result.data);
  const batchSettled = !batchLoading && !blocked;

  useEffect(() => {
    if (!active || slice.length === 0 || !batchSettled) return;

    for (let index = 0; index < slice.length; index += 1) {
      const country = slice[index];
      const data = results[index]?.data;
      const match = data?.users?.find(
        (user) => user.username.toLowerCase() === key,
      );
      if (match) {
        const found: RankingHit = {
          committer: match,
          countrySlug: country.slug,
          countryName: country.name,
          flagUrl: country.flagUrl,
        };
        cache.set(key, found);
        setHit(found);
        return;
      }
    }

    const nextStart = start + BATCH_SIZE;
    if (nextStart >= ordered.length) {
      cache.set(key, null);
      setExhausted(true);
      return;
    }
    setBatch((value) => value + 1);
    // `results` is recreated every render; the slice identity is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, batchSettled, key, start, slice.length, ordered.length]);

  const isLookingUp =
    active && !isLoadingCountries && (batchLoading || blocked);

  return {
    ranking: hit,
    isLookingUp,
    notRanked: exhausted,
  };
};
