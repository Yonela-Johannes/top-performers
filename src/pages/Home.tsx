import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";

import {
  ArrowDownAZ,
  ArrowRight,
  ArrowUpAZ,
  Loader2,
  Search,
  ServerCrash,
  X,
} from "lucide-react";
import type { Committer } from "@/types";
import { CountryCard } from "@/components/common/CountryCard";
import { UserDialog } from "@/components/common/UserDialog";
import { RouteLine } from "@/components/atlas";
import { regionTheme } from "@/lib/regionTheme";
import { useCountrySearch } from "@/hooks/useCountrySearch";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import {
  absoluteUrl,
  defaultOgImage,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_OWNER,
  SITE_TAGLINE,
  SITE_URL,
  SOURCE_NAME,
  SOURCE_URL,
  toTitle,
} from "@/lib/seo";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { ALL_REGIONS } from "@/lib/countries";

const COUNTRIES_PER_PAGE = 18;
type SortDirection = "asc" | "desc";

const HomeLoading = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="panel flex h-[318px] flex-col p-5">
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-11" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-2.5 w-20" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <div className="skeleton h-7 w-7" />
              <div className="skeleton h-3.5 flex-1" />
              <div className="skeleton h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const Home = () => {
  const {
    allCountries,
    filteredCountries: matchedCountries,
    isLoadingCountries,
    countriesError,
    refetchCountries,
    countryToRegion,
    regionOptions,
    search,
    activeRegion,
    selectRegion,
    resetFilters,
  } = useCountrySearch();

  const [selectedUser, setSelectedUser] = useState<Committer | null>(null);
  const [visibleCount, setVisibleCount] = useState(COUNTRIES_PER_PAGE);
  const [sortOrder, setSortOrder] = useState<SortDirection>("asc");

  const filteredCountries = useMemo(() => {
    const sorted = [...matchedCountries];
    sorted.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
    return sorted;
  }, [matchedCountries, sortOrder]);

  const visibleCountForResults = Math.min(
    visibleCount,
    filteredCountries.length,
  );
  const visibleCountries = useMemo(
    () => filteredCountries.slice(0, visibleCountForResults),
    [filteredCountries, visibleCountForResults],
  );
  const hasMoreCountries = visibleCountForResults < filteredCountries.length;

  // A new query or region restarts the list; sorting keeps the current depth.
  useEffect(() => {
    setVisibleCount(COUNTRIES_PER_PAGE);
  }, [search, activeRegion]);

  useInfiniteScroll({
    isLoading: isLoadingCountries,
    hasMore: hasMoreCountries,
    onLoadMore: () => setVisibleCount((prev) => prev + COUNTRIES_PER_PAGE),
    threshold: 320,
  });

  const showMore = () =>
    setVisibleCount(visibleCountForResults + COUNTRIES_PER_PAGE);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setVisibleCount(COUNTRIES_PER_PAGE);
  };

  const resetExploration = () => {
    resetFilters();
    setVisibleCount(COUNTRIES_PER_PAGE);
  };

  const homeTitle = toTitle("Global developer rankings by country");
  const homeUrl = absoluteUrl("/");
  const homeStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: {
        "@type": "Person",
        name: SITE_OWNER,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${homeUrl}?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "TopPerformers global developer rankings",
      description: SITE_DESCRIPTION,
      url: homeUrl,
      creator: {
        "@type": "Person",
        name: SITE_OWNER,
      },
      license: "https://opensource.org/license/mit",
      keywords: SITE_KEYWORDS,
      temporalCoverage: `${new Date().getFullYear()}`,
      spatialCoverage: "Worldwide",
    },
  ];

  const GRID_LEVELS = [
    0, 1, 0, 2, 1, 0, 3, 1, 2, 0, 1, 0, 1, 2, 3, 2, 1, 0, 2, 3, 1, 0, 1, 2, 0,
    1, 3, 2, 1, 0, 1, 2, 0, 1, 2, 1,
  ];
  const GRID_FILL = [
    "bg-foreground/10",
    "bg-[var(--mint)]",
    "bg-[var(--sky)]",
    "bg-[var(--sun)]",
  ] as const;
  function SkeletonValue({ className = "" }: { className?: string }) {
    return (
      <span
        aria-hidden="true"
        className={`inline-block animate-pulse bg-foreground/10 ${className}`}
      />
    );
  }

  return (
    <div className="pb-20">
      <Helmet>
        <title>{homeTitle}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="keywords" content={SITE_KEYWORDS.join(", ")} />
        <meta name="author" content={SITE_OWNER} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={homeUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={homeTitle} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:url" content={homeUrl} />
        <meta property="og:image" content={defaultOgImage} />
        <meta property="og:image:alt" content={`${SITE_NAME} preview`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={homeTitle} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={defaultOgImage} />
        <meta name="twitter:image:alt" content={`${SITE_NAME} preview`} />
        <script type="application/ld+json">
          {JSON.stringify(homeStructuredData)}
        </script>
      </Helmet>

      <div className="shell">
        <section
          aria-labelledby="hero-heading"
          className="flex flex-col items-center justify-center lamplight notebook-surface relative -mx-5 overflow-hidden px-5 pb-14 min-h-[75vh] pt-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 lg:pb-16 lg:pt-20"
        >
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
            <div className="max-w-3xl">
              <h1
                id="hero-heading"
                className="font-display text-[clamp(2.6rem,5.4vw,3.75rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em] text-foreground"
              >
                <span className="block">
                  Open source{" "}
                  <span className="marker-highlight">builders.</span>
                </span>
                <span className="relative mt-2 inline-block text-brand-ink">
                  ranked by country.
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 20"
                    preserveAspectRatio="none"
                    className="absolute -bottom-2 left-[-2%] h-3 w-[104%] overflow-visible"
                  >
                    <path
                      d="M3 12 C40 4 70 16 100 9 S160 5 197 11"
                      fill="none"
                      stroke="var(--tangerine)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">
                A chart of the world's open-source contributors. Pick a
                destination and see who's building there.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#explore-heading" className="button-primary">
                  Pick a destination{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="#how-it-works" className="button-secondary">
                  How it works
                </a>
              </div>
            </div>

            <aside
              aria-label="Index summary"
              aria-busy={isLoadingCountries}
              className="hard-card relative w-full max-w-sm bg-card p-5 lg:mt-4 lg:w-64 lg:rotate-[1.5deg]"
            >
              <p className="mt-3 flex items-baseline gap-2 font-display text-5xl leading-none text-foreground">
                {isLoadingCountries ? (
                  <>
                    <SkeletonValue className="h-10 w-16" />
                    <span className="sr-only">Loading countries</span>
                  </>
                ) : (
                  allCountries.length
                )}
                <span className="font-sans text-sm font-semibold text-foreground/80">
                  countries
                </span>
              </p>

              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {isLoadingCountries ? (
                  <SkeletonValue className="h-4 w-28" />
                ) : (
                  <>across {regionOptions.length} regions</>
                )}
              </p>

              {/* Decorative only: fixed pattern, not data */}
              <div aria-hidden="true" className="mt-5 grid grid-cols-12 gap-1">
                {GRID_LEVELS.map((level, i) => (
                  <span key={i} className={`h-3 ${GRID_FILL[level]}`} />
                ))}
              </div>
            </aside>
          </div>

          <RouteLine className="mt-10 max-w-3xl" />
        </section>
        <div
          className="sticky z-30 -mx-5  bg-background/95 px-5 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          style={{ top: "var(--nav-height)" }}
        >
          <div>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Pick a region
                <span className="text-foreground">
                  {" · "}
                  {activeRegion === ALL_REGIONS ? "Worldwide" : activeRegion}
                </span>
                {search.trim() && (
                  <span className="text-foreground">
                    {" · “"}
                    <span className="normal-case">{search.trim()}</span>
                    {"”"}
                  </span>
                )}
              </p>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSort}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 border border-border bg-card px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:border-foreground/25 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Sort countries ${sortOrder === "asc" ? "Z to A" : "A to Z"}`}
                  title={`Sort ${sortOrder === "asc" ? "Z to A" : "A to Z"}`}
                >
                  {sortOrder === "asc" ? (
                    <ArrowDownAZ className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ArrowUpAZ className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{sortOrder === "asc" ? "A–Z" : "Z–A"}</span>
                </button>
              </div>
            </div>

            <div
              className="no-scrollbar -mx-1 flex snap-x items-center gap-2 overflow-x-auto px-1 pb-1 pt-1"
              role="group"
              aria-label="Filter countries by region"
            >
              <button
                type="button"
                onClick={() => selectRegion(ALL_REGIONS)}
                aria-pressed={activeRegion === ALL_REGIONS}
                className="chip min-h-9 shrink-0 snap-start gap-2 px-3.5 text-[11px] font-semibold uppercase tracking-[0.06em]"
              >
                <span>All regions</span>
                <span className="bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
                  {allCountries.length}
                </span>
              </button>

              {regionOptions.map((region) => {
                const isActive = activeRegion === region.name;

                return (
                  <button
                    key={region.name}
                    type="button"
                    onClick={() => selectRegion(region.name)}
                    aria-pressed={isActive}
                    className="chip min-h-9 shrink-0 snap-start gap-2 px-3.5 text-[11px] font-semibold uppercase tracking-[0.06em]"
                  >
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 border border-black/20"
                      style={{ background: regionTheme(region.name).fill }}
                    />
                    <span>{region.name}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] leading-none ${
                        isActive
                          ? "bg-primary-foreground/15 text-primary-foreground"
                          : "bg-[var(--surface-muted)] text-muted-foreground"
                      }`}
                    >
                      {region.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <section
          aria-labelledby="explore-heading"
          className="scroll-mt-[calc(var(--nav-height)+5.5rem)]"
        >
          {/* Section heading */}
          <div className="relative mb-6 border-b border-border pb-5 pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2
                  id="explore-heading"
                  className="font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground sm:text-5xl"
                >
                  {activeRegion === ALL_REGIONS ? (
                    <>
                      Explore the
                      <br className="sm:hidden" />{" "}
                      <span className="marker-highlight">country.</span>
                    </>
                  ) : (
                    <>
                      Explore
                      <br className="sm:hidden" />{" "}
                      <span className="marker-highlight">{activeRegion}.</span>
                    </>
                  )}
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                  Find the developers contributing to open source, one country
                  at a time.
                </p>
              </div>

              {/* Results indicator */}
              <div
                className="flex shrink-0 items-center gap-3 border border-border bg-card px-3.5 py-2.5"
                aria-live="polite"
                aria-atomic="true"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 ${
                    isLoadingCountries
                      ? "animate-pulse bg-[var(--tangerine)]"
                      : countriesError
                        ? "bg-destructive"
                        : "bg-foreground"
                  }`}
                />

                <div>
                  <p className="font-display text-xl font-extrabold leading-none text-foreground tabular-nums">
                    {isLoadingCountries ? "..." : filteredCountries.length}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {isLoadingCountries
                      ? "Indexing"
                      : filteredCountries.length === 1
                        ? "Country"
                        : "Countries"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error state */}
          {countriesError ? (
            <div
              role="alert"
              className="relative overflow-hidden border-2 border-foreground bg-card p-6 shadow-[5px_5px_0_var(--foreground)] sm:p-10"
            >
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-foreground bg-destructive/10">
                  <ServerCrash
                    className="h-6 w-6 text-destructive"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-destructive">
                    Connection interrupted / 503
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold uppercase text-foreground sm:text-3xl">
                    The index is out of reach.
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    We couldn't retrieve the country data. Check your connection
                    and try again.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => refetchCountries()}
                  className="button-primary shrink-0"
                >
                  <Loader2 className="h-4 w-4" aria-hidden="true" />
                  Retry connection
                </button>
              </div>
            </div>
          ) : isLoadingCountries ? (
            <HomeLoading />
          ) : filteredCountries.length === 0 ? (
            /* Empty state */
            <div className="relative overflow-hidden border-2 border-foreground bg-card px-6 py-14 text-center shadow-[5px_5px_0_var(--foreground)] sm:py-20">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 -top-8 rotate-12 font-display text-[9rem] font-black leading-none text-foreground/[0.04] sm:text-[12rem]"
              >
                ?
              </span>

              <div className="relative mx-auto flex h-14 w-14 items-center justify-center border-2 border-foreground bg-[var(--tangerine)] shadow-[3px_3px_0_var(--foreground)]">
                <Search
                  className="h-6 w-6 text-foreground"
                  aria-hidden="true"
                />
              </div>

              <p className="relative mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Nothing in this edition
              </p>

              <h3 className="relative mt-2 font-display text-2xl font-extrabold uppercase text-foreground sm:text-3xl">
                No countries found.
              </h3>

              <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                {search
                  ? `We couldn't find a country matching "${search}"${
                      activeRegion !== ALL_REGIONS ? ` in ${activeRegion}` : ""
                    }. Try another search or reset your filters.`
                  : "There are no countries to display for this region right now. Try exploring another region."}
              </p>

              <button
                type="button"
                onClick={resetExploration}
                className="button-secondary relative mt-6"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Reset exploration
              </button>
            </div>
          ) : (
            <>
              {/* Country directory */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCountries.map((country) => (
                  <div
                    key={country.slug}
                    className="min-w-0 motion-safe:animate-fade-in-up"
                  >
                    <CountryCard
                      country={country}
                      region={countryToRegion[country.name.toLowerCase()]}
                      onUserClick={setSelectedUser}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-10 border-t-2 border-foreground pt-5">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <p className="font-display text-lg font-bold uppercase text-foreground">
                      {hasMoreCountries
                        ? "Keep exploring."
                        : "You've reached the end."}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Showing {visibleCountries.length} of{" "}
                      {filteredCountries.length} countries
                    </p>
                  </div>

                  {hasMoreCountries && (
                    <button
                      type="button"
                      onClick={showMore}
                      className="button-secondary w-full sm:w-auto"
                    >
                      Load more countries
                      <ArrowDownAZ className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Visual progress indicator */}
                <div
                  className="mt-5 h-2 border border-foreground bg-secondary"
                  role="progressbar"
                  aria-label="Countries displayed"
                  aria-valuemin={0}
                  aria-valuemax={filteredCountries.length}
                  aria-valuenow={visibleCountries.length}
                >
                  <div
                    className="h-full bg-[var(--tangerine)] transition-[width] duration-300"
                    style={{
                      width: `${
                        filteredCountries.length > 0
                          ? Math.min(
                              100,
                              (visibleCountries.length /
                                filteredCountries.length) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </section>

        {/* Indigo feature band: how the rankings are built (one per page) */}
        <section
          id="how-it-works"
          className="indigo-band relative mt-16 scroll-mt-[calc(var(--nav-height)+2rem)] overflow-hidden border-y-2 border-foreground lg:mt-20"
          aria-labelledby="how-heading"
        >
          <div
            aria-hidden="true"
            className="pattern-lattice pointer-events-none absolute inset-x-0 top-0 h-16 text-[var(--band-fg)] opacity-[0.14]"
          />
          <div className="relative grid gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-16">
            <div>
              <p
                className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]"
                style={{ color: "var(--band-accent)" }}
              >
                How it works
              </p>
              <h2
                id="how-heading"
                className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.98] tracking-tight text-[var(--band-fg)] sm:text-5xl"
              >
                A simple measure,
                <br />
                honestly presented.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--band-fg-muted)]">
                TopPerformers is not a measure of skill or seniority. It is a
                transparent snapshot of public open-source activity, grouped by
                the country listed on each GitHub profile.
              </p>
            </div>

            <div className="divide-y-2 divide-dashed divide-[var(--band-line)]">
              {[
                {
                  index: "01",
                  title: "Public activity",
                  body: "Each ranking is based on public commit counts collected from ranked GitHub profiles.",
                },
                {
                  index: "02",
                  title: "Country grouping",
                  body: "A developer's country comes from the location shared publicly on their GitHub profile.",
                },
                {
                  index: "03",
                  title: "Refreshed by the data pipeline",
                  body: `Country indexes are regenerated from ${SOURCE_NAME} whenever the data pipeline runs — the stamp on each country page shows the exact date of the current data.`,
                },
              ].map((item) => (
                <div
                  key={item.index}
                  className="grid grid-cols-[auto_1fr] gap-5 py-6 sm:gap-8"
                >
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--band-accent)" }}
                  >
                    {item.index}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--band-fg)]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--band-fg-muted)]">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-xs leading-5 text-[var(--band-fg-muted)]">
                  Rankings are read from{" "}
                  <a
                    href={SOURCE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[var(--band-fg)] underline underline-offset-4"
                    style={{ textDecorationColor: "var(--band-accent)" }}
                  >
                    {SOURCE_NAME}
                  </a>
                  . Missing a country? Your GitHub location may need to be
                  public.
                </p>
                <Link
                  to="/"
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--band-fg)]"
                >
                  Browse destinations
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <p className="sr-only">{SITE_TAGLINE}</p>
      </div>

      {selectedUser && (
        <UserDialog
          user={selectedUser}
          open={true}
          onOpenChange={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default Home;
