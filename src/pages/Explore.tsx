import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Compass, Search, SearchX, Trophy, X } from "lucide-react";

import { useGetCountryUsersQuery, useGetMetadataQuery } from "@/api";
import type { Country } from "@/api/countriesApi";
import { useCountrySearch } from "@/hooks/useCountrySearch";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { formatCompactNumber } from "@/lib/format";
import { absoluteUrl, SITE_NAME, toTitle } from "@/lib/seo";
import { PageHeader, SectionHeading } from "@/components/common/PageHeader";
import { CountryCard } from "@/components/common/CountryCard";
import { Card, CardMessage, SkeletonBlock } from "@/components/common/Card";
import { RegionBadge } from "@/components/atlas";
import { regionTheme } from "@/lib/regionTheme";

const PAGE_SIZE = 12;

const ExploreLoading = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} className="h-[308px]" aria-busy="true">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-11" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-2.5 w-20" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <SkeletonBlock className="h-16 rounded-lg" />
          <SkeletonBlock className="h-16 rounded-lg" />
        </div>
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <SkeletonBlock className="h-7 w-7 rounded-full" />
              <SkeletonBlock className="h-3.5 flex-1" />
              <SkeletonBlock className="h-3 w-10" />
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

/**
 * Explore.
 *
 * The reference project's "Discover" surface — a paginated directory that
 * mixes content types — is genuinely useful, but TopPerformers' directory is
 * its country index and the developers inside it. This page therefore keeps
 * the directory pattern (filters, a featured lead, a card grid, progressive
 * loading) and points it at real ranking data: a spotlight for the current
 * leader, region filters, the country grid, and a direct handle lookup.
 */
const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    allCountries,
    filteredCountries,
    isLoadingCountries,
    countriesError,
    refetchCountries,
    countryToRegion,
    regionOptions,
    search,
    setSearch,
    clearSearch,
    activeRegion,
    selectRegion,
    resetFilters,
  } = useCountrySearch();
  const { data: metadata } = useGetMetadataQuery();

  // `?featured=<slug>` deep-links to a country; selecting one here updates it.
  const featuredSlug = searchParams.get("featured");
  const setFeaturedSlug = (slug: string | null) => {
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        if (slug) next.set("featured", slug);
        else next.delete("featured");
        return next;
      },
      { replace: true },
    );
  };

  const featuredCountry = useMemo(
    () => allCountries.find((country) => country.slug === featuredSlug) ?? null,
    [allCountries, featuredSlug],
  );

  const { currentData: featuredData, isLoading: featuredLoading } =
    useGetCountryUsersQuery(
      featuredCountry
        ? { country: featuredCountry.slug, mode: "all" }
        : skipToken,
      { skip: !featuredCountry },
    );

  // Progressive rendering keeps the first paint light with 151 country cards.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = filteredCountries.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCountries.length;

  useInfiniteScroll({
    isLoading: isLoadingCountries,
    hasMore,
    onLoadMore: () => setVisibleCount((count) => count + PAGE_SIZE),
    threshold: 360,
  });

  const updateSearch = (value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };

  const pickRegion = (region: string) => {
    selectRegion(region);
    setVisibleCount(PAGE_SIZE);
  };



  const spotlight = useMemo(() => {
    const users = featuredData?.users ?? [];
    if (!users.length && !featuredCountry) return null;
    const lead = [...users].sort((a, b) => b.commits - a.commits)[0];
    const commits = users.reduce((sum, user) => sum + user.commits, 0);
    return {
      lead,
      developers: users.length,
      commits,
    };
  }, [featuredData, featuredCountry]);

  const title = toTitle("Explore developers and countries");
  const pageUrl = absoluteUrl("/explore");

  return (
    <div className="pb-20">
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content={`Browse every country indexed by ${SITE_NAME}, filter by region, and open a developer's GitHub profile, repositories, languages and activity.`}
        />
        <link rel="canonical" href={pageUrl} />
      </Helmet>

      <div className="shell">
        <PageHeader
          eyebrow="Explore"
          title={
            <>
              Find a country,{" "}
              <span className="text-brand-ink">a developer.</span>
            </>
          }
          description="Every indexed country in one directory. Filter by region, jump to a leaderboard, or look up a handle and open its developer page."
          meta={
            <>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                {isLoadingCountries
                  ? "Indexing…"
                  : `${allCountries.length} countries`}
              </span>
              {metadata?.generatedAt ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  Index updated{" "}
                  {new Intl.DateTimeFormat("en", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(metadata.generatedAt))}
                </span>
              ) : null}
            </>
          }
          actions={
            <Link to="/" className="button-secondary">
              World index
            </Link>
          }
        />

        {/* Featured: the current leaderboard, from real data */}
        <section aria-labelledby="featured-heading" className="pt-8">
          <SectionHeading
            id="featured-heading"
            eyebrow="Spotlight"
            title={
              featuredCountry
                ? `${featuredCountry.name}, at a glance`
                : "Spotlight a country"
            }
            description="Feature a country's leaderboard at the top of this page."
            action={
              featuredCountry ? (
                <button
                  type="button"
                  onClick={() => setFeaturedSlug(null)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear
                </button>
              ) : undefined
            }
          />

          {featuredCountry ? (
            <Card className="mt-4">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <img
                  src={featuredCountry.flagUrl}
                  alt=""
                  className="h-14 w-20 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <RegionBadge
                    region={countryToRegion[featuredCountry.name.toLowerCase()]}
                  />
                  <h3 className="mt-1 font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-foreground">
                    {featuredCountry.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {featuredLoading
                      ? "Loading the leaderboard…"
                      : spotlight?.lead
                        ? `Led by @${spotlight.lead.username} with ${spotlight.lead.commits.toLocaleString()} public commits.`
                        : "No public commit activity recorded yet."}
                  </p>
                </div>
                <dl className="flex gap-6 sm:gap-8">
                  <div>
                    <dt className="card-label">Developers</dt>
                    <dd className="stat-value mt-1 text-2xl font-semibold text-foreground">
                      {featuredLoading
                        ? "—"
                        : formatCompactNumber(spotlight?.developers ?? 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="card-label">Commits</dt>
                    <dd className="stat-value mt-1 text-2xl font-semibold text-foreground">
                      {featuredLoading
                        ? "—"
                        : formatCompactNumber(spotlight?.commits ?? 0)}
                    </dd>
                  </div>
                </dl>
                <Link
                  to={`/${featuredCountry.slug}`}
                  className="button-primary shrink-0"
                >
                  Open leaderboard
                </Link>
              </div>
            </Card>
          ) : (
            <Card tone="muted" className="mt-4">
              <CardMessage
                icon={<Trophy />}
                title="Pick a country to feature"
                description="Choose “Spotlight this country” under any card in the directory below."
              />
            </Card>
          )}
        </section>

        {/* Filters */}
        <section aria-labelledby="directory-heading" className="pt-10">
          <SectionHeading
            id="directory-heading"
            eyebrow="Directory"
            title="Countries"
            action={
              <p
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
                role="status"
              >
                {isLoadingCountries
                  ? "Loading…"
                  : `${filteredCountries.length} shown`}
              </p>
            }
          />

          <div className="sticky top-[var(--nav-height)] z-20 -mx-5 mt-4 border-y border-border bg-background/95 px-5 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1 sm:max-w-xs">
                <label htmlFor="country-filter" className="sr-only">
                  Filter countries
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="country-filter"
                  type="search"
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Filter countries"
                  autoComplete="off"
                  className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-search-cancel-button]:appearance-none"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear country filter"
                    className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div
                className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1"
                role="group"
                aria-label="Filter by region"
              >
                <button
                  type="button"
                  onClick={() => pickRegion("All")}
                  aria-pressed={activeRegion === "All"}
                  className="chip shrink-0 whitespace-nowrap py-1.5"
                >
                  All regions
                </button>
                {regionOptions.map((region) => (
                  <button
                    key={region.name}
                    type="button"
                    onClick={() => pickRegion(region.name)}
                    aria-pressed={activeRegion === region.name}
                    className="chip shrink-0 whitespace-nowrap py-1.5"
                  >
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full border border-foreground/30"
                      style={{ background: regionTheme(region.name).fill }}
                    />
                    {region.name}
                    <span className="text-muted-foreground">
                      {region.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-5">
            {countriesError ? (
              <Card>
                <CardMessage
                  tone="danger"
                  title="Couldn’t load the directory"
                  description="The country index is out of reach. Check your connection and try again."
                  action={
                    <button
                      type="button"
                      onClick={() => refetchCountries()}
                      className="button-primary"
                    >
                      Retry
                    </button>
                  }
                />
              </Card>
            ) : isLoadingCountries ? (
              <ExploreLoading />
            ) : filteredCountries.length === 0 ? (
              <Card>
                <CardMessage
                  icon={<SearchX />}
                  title="No countries match"
                  description={
                    search
                      ? `Nothing matches “${search}”${activeRegion !== "All" ? ` in ${activeRegion}` : ""}. Try another term or reset the filters.`
                      : "There are no countries in this region right now."
                  }
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        resetFilters();
                        setVisibleCount(PAGE_SIZE);
                      }}
                      className="button-secondary"
                    >
                      Reset filters
                    </button>
                  }
                />
              </Card>
            ) : (
              <>
                <ul className="grid grid-cols-1 items-stretch gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((country: Country) => (
                    <li key={country.slug} className="flex min-w-0 flex-col">
                      <CountryCard
                        country={country}
                        region={countryToRegion[country.name.toLowerCase()]}
                        onUserClick={() => undefined}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedSlug(country.slug);
                          document
                            .getElementById("featured-heading")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }}
                        className="mt-2 inline-flex items-center gap-1 rounded px-1 py-1 text-xs font-medium text-ink-secondary transition-colors hover:text-brand-ink"
                        aria-pressed={false}
                      >
                        <Trophy className="h-3 w-3" aria-hidden="true" />
                        Spotlight this country
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Showing {visible.length} of {filteredCountries.length}
                  </p>
                  {hasMore ? (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((count) => count + PAGE_SIZE)
                      }
                      className="button-secondary"
                    >
                      Load more countries
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Explore;
