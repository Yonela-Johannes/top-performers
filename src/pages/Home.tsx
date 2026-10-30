import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDownAZ,
  ArrowRight,
  ArrowUpAZ,
  ArrowUpRight,
  Loader2,
  Search,
  ServerCrash,
  Sparkles,
  X,
} from "lucide-react";
import { useGetCountriesQuery, useGetMetadataQuery } from "@/api/countriesApi";
import { useGetFlagsQuery } from "@/api/flagsApi";
import type { Committer } from "@/types";
import { CountryCard } from "@/components/common/CountryCard";
import { UserDialog } from "@/components/common/UserDialog";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { formatDate } from "@/lib/format";
import {
  absoluteUrl,
  defaultOgImage,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_OWNER,
  SITE_TAGLINE,
  SITE_URL,
  toTitle,
} from "@/lib/seo";

const COUNTRIES_PER_PAGE = 18;
const REGION_ORDER = [
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
  "Other",
];
type SortDirection = "asc" | "desc";

const HomeLoading = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="surface flex h-[318px] flex-col p-5">
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-11" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-2.5 w-20" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4">
          <div className="skeleton h-10" />
          <div className="skeleton h-10" />
        </div>
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <div className="skeleton h-7 w-7 rounded-full" />
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
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    data: allCountries = [],
    isLoading: isLoadingCountries,
    error: countriesError,
    refetch: refetchCountries,
  } = useGetCountriesQuery();
  const { data: flagsData = [] } = useGetFlagsQuery();
  const { data: metadata } = useGetMetadataQuery();

  const [selectedUser, setSelectedUser] = useState<Committer | null>(null);
  const [visibleCount, setVisibleCount] = useState(COUNTRIES_PER_PAGE);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [sortOrder, setSortOrder] = useState<SortDirection>("asc");
  const [activeRegion, setActiveRegion] = useState(
    () => searchParams.get("region") || "All",
  );

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setActiveRegion(searchParams.get("region") || "All");
  }, [searchParams]);

  const countryToRegion = useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(flagsData)) {
      flagsData.forEach((item) => {
        if (item.name && item.continent) {
          map[item.name.toLowerCase()] = item.continent;
        }
      });
    }
    return map;
  }, [flagsData]);

  const regionOptions = useMemo(() => {
    const counts = new Map<string, number>();
    allCountries.forEach((country) => {
      const region = countryToRegion[country.name.toLowerCase()] || "Other";
      counts.set(region, (counts.get(region) || 0) + 1);
    });

    return REGION_ORDER.filter((region) => counts.has(region)).map(
      (region) => ({
        name: region,
        count: counts.get(region) || 0,
      }),
    );
  }, [allCountries, countryToRegion]);

  const filteredCountries = useMemo(() => {
    let filtered = [...allCountries];

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      filtered = filtered.filter(
        (country) =>
          country.name.toLowerCase().includes(query) ||
          country.slug.toLowerCase().includes(query),
      );
    }

    if (activeRegion !== "All") {
      filtered = filtered.filter(
        (country) =>
          (countryToRegion[country.name.toLowerCase()] || "Other") ===
          activeRegion,
      );
    }

    filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    return filtered;
  }, [allCountries, search, activeRegion, countryToRegion, sortOrder]);

  const visibleCountries = useMemo(
    () => filteredCountries.slice(0, visibleCount),
    [filteredCountries, visibleCount],
  );
  const hasMoreCountries = visibleCount < filteredCountries.length;

  useInfiniteScroll({
    isLoading: isLoadingCountries,
    hasMore: hasMoreCountries,
    onLoadMore: () => setVisibleCount((prev) => prev + COUNTRIES_PER_PAGE),
    threshold: 320,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisibleCount(COUNTRIES_PER_PAGE);

    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set("search", value.trim());
    else nextParams.delete("search");
    setSearchParams(nextParams, { replace: true });
  };

  const clearSearch = () => handleSearchChange("");

  const selectRegion = (region: string) => {
    setActiveRegion(region);
    setVisibleCount(COUNTRIES_PER_PAGE);

    const nextParams = new URLSearchParams(searchParams);
    if (region === "All") nextParams.delete("region");
    else nextParams.set("region", region);
    setSearchParams(nextParams, { replace: true });
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setVisibleCount(COUNTRIES_PER_PAGE);
  };

  const resetFilters = () => {
    setActiveRegion("All");
    setSearch("");
    setVisibleCount(COUNTRIES_PER_PAGE);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    nextParams.delete("region");
    setSearchParams(nextParams, { replace: true });
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
        className={`inline-block animate-pulse rounded-md bg-foreground/10 ${className}`}
      />
    );
  }

  // …inside the component:
  const generatedAt = metadata?.generatedAt;

  const facts = [
    { label: "Ranking metric", value: "Public commits" },
    { label: "Data source", value: "GitHub" },
    {
      label: "Last updated",
      value: generatedAt ? (
        <time dateTime={generatedAt}>{formatDate(generatedAt)}</time>
      ) : (
        "Unavailable"
      ),
    },
  ];

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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={homeTitle} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={defaultOgImage} />
        <script type="application/ld+json">
          {JSON.stringify(homeStructuredData)}
        </script>
      </Helmet>

      <div className="shell">
        <section
          aria-labelledby="hero-heading"
          className="notebook-surface relative -mx-5 overflow-hidden border-b-2 border-foreground px-5 pb-14 pt-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 lg:pb-16 lg:pt-20"
        >
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
            <div className="max-w-3xl">
              <h1
                id="hero-heading"
                className="font-display text-[clamp(2.6rem,5.4vw,4.75rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em] text-foreground"
              >
                <span className="block">
                  People building{" "}
                  <span className="marker-highlight">open source.</span>
                </span>
                <span className="relative mt-2 inline-block text-brand-ink">
                  Ranked by country.
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
                Discover developers around the world through their GitHub
                activity. Explore country rankings and see who's contributing to
                open source.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#explore-heading" className="button-primary">
                  Explore countries{" "}
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
              <span
                aria-hidden="true"
                className="tape tape-sky pointer-events-none hidden lg:block"
              />

              <p className="eyebrow">The index</p>

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
                  <span
                    key={i}
                    className={`h-3 rounded-[2px] ${GRID_FILL[level]}`}
                  />
                ))}
              </div>
            </aside>
          </div>

          <dl className="mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {facts.map((fact, index) => (
              <div
                key={fact.label}
                className={`group relative overflow-hidden border-2 border-foreground p-5 transition-transform duration-200 hover:-translate-y-1  rounded-lg ${
                  index === 0
                    ? "bg-[var(--tangerine)] text-foreground shadow-[5px_5px_0_var(--foreground)]"
                    : index === 1
                      ? "bg-[#D8E8C8] text-foreground shadow-[5px_5px_0_var(--foreground)]"
                      : index === 2
                        ? "bg-[#DCD5F7] text-foreground shadow-[5px_5px_0_var(--foreground)]"
                        : "bg-card text-foreground shadow-[5px_5px_0_var(--foreground)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                    {fact.label}
                  </dt>

                  <span
                    aria-hidden="true"
                    className="font-mono text-xs opacity-60"
                  >
                    {String(index + 1)}
                  </span>
                </div>

                <dd className="mt-8 break-words font-display text-xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-2xl">
                  {fact.value}
                </dd>

                <span
                  aria-hidden="true"
                  className="absolute -bottom-5 -right-3 rotate-[-12deg] font-display text-7xl font-black leading-none opacity-[0.07] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  aria-hidden="true"
                  className="absolute bottom-3 right-4 h-2 w-2 rounded-full border-2 border-current"
                />
              </div>
            ))}
          </dl>
        </section>
        <div className="sticky top-16 z-30 -mx-5 border-y-2 border-foreground bg-background/95 px-5 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {/* Search and sort */}
          <div className="flex items-stretch gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="country-search" className="sr-only">
                Search countries
              </label>

              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-foreground"
                aria-hidden="true"
              />

              <input
                id="country-search"
                type="search"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Find a country..."
                autoComplete="off"
                className="h-12 w-full rounded-none border-2 border-foreground bg-card pl-10 pr-10 font-medium text-foreground shadow-[3px_3px_0_var(--foreground)] outline-none transition-[box-shadow,transform] placeholder:font-normal placeholder:text-muted-foreground focus-visible:translate-x-0.5 focus-visible:translate-y-0.5 focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={toggleSort}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 border-2 border-foreground bg-card px-3 font-mono text-xs font-bold uppercase tracking-wide text-foreground shadow-[3px_3px_0_var(--foreground)] transition-[box-shadow,transform,background-color] hover:bg-secondary active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4"
              aria-label={`Sort countries ${sortOrder === "asc" ? "Z to A" : "A to Z"}`}
              title={`Sort ${sortOrder === "asc" ? "Z to A" : "A to Z"}`}
            >
              {sortOrder === "asc" ? (
                <ArrowDownAZ className="h-[18px] w-[18px]" aria-hidden="true" />
              ) : (
                <ArrowUpAZ className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {sortOrder === "asc" ? "A–Z" : "Z–A"}
              </span>
            </button>
          </div>

          {/* Region navigation */}
          <div className="mt-5">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Explore by region
              </span>

              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {activeRegion === "All" ? "Worldwide" : activeRegion}
              </span>
            </div>

            <div
              className="no-scrollbar -mx-1 flex snap-x items-center gap-2 overflow-x-auto px-1 pb-2 pt-1"
              role="group"
              aria-label="Filter countries by region"
            >
              <button
                type="button"
                onClick={() => selectRegion("All")}
                aria-pressed={activeRegion === "All"}
                className={`inline-flex min-h-10 shrink-0 snap-start items-center gap-2 border-2 px-3.5 font-mono text-[11px] font-bold uppercase tracking-wide transition-[background-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  activeRegion === "All"
                    ? "border-foreground bg-foreground text-background shadow-[3px_3px_0_var(--tangerine)]"
                    : "border-foreground/20 bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                <span>All regions</span>
                <span
                  className={`border px-1.5 py-0.5 text-[10px] ${
                    activeRegion === "All"
                      ? "border-background/30"
                      : "border-current/20"
                  }`}
                >
                  {allCountries.length}
                </span>
              </button>

              {regionOptions.map((region, index) => {
                const isActive = activeRegion === region.name;

                return (
                  <button
                    key={region.name}
                    type="button"
                    onClick={() => selectRegion(region.name)}
                    aria-pressed={isActive}
                    className={`inline-flex min-h-10 shrink-0 snap-start items-center gap-2 border-2 px-3.5 font-mono text-[11px] font-bold uppercase tracking-wide transition-[background-color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-foreground bg-foreground text-background shadow-[3px_3px_0_var(--tangerine)]"
                        : "border-foreground/20 bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{region.name}</span>

                    <span
                      className={`border px-1.5 py-0.5 text-[10px] ${
                        isActive ? "border-background/30" : "border-current/20"
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

        <section aria-labelledby="explore-heading" className="scroll-mt-40">
          {/* Section heading */}
          <div className="relative mb-6 border-b-2 border-foreground pb-5 pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2
                  id="explore-heading"
                  className="font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground sm:text-5xl"
                >
                  {activeRegion === "All" ? (
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
                className="flex shrink-0 items-center gap-3 border-2 border-foreground bg-card px-3.5 py-3 shadow-[3px_3px_0_var(--foreground)]"
                aria-live="polite"
                aria-atomic="true"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${
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
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
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
                      activeRegion !== "All" ? ` in ${activeRegion}` : ""
                    }. Try another search or reset your filters.`
                  : "There are no countries to display for this region right now. Try exploring another region."}
              </p>

              <button
                type="button"
                onClick={resetFilters}
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
                {visibleCountries.map((country, index) => (
                  <div key={country.slug} className="min-w-0">
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
                      onClick={() =>
                        setVisibleCount((prev) => prev + COUNTRIES_PER_PAGE)
                      }
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

        {/* <section
          id="how-it-works"
          className="mt-20 scroll-mt-24 border-t border-border pt-12 lg:mt-24 lg:pt-16"
        >
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-3.5 w-3.5 text-brand-ink"
                  aria-hidden="true"
                />
                <p className="eyebrow">How it works</p>
              </div>
              <h2 className="mt-4 font-display text-4xl leading-[0.98] text-foreground sm:text-5xl">
                A simple measure,
                <br />
                honestly presented.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
                TopPerformers is not a measure of skill or seniority. It is a
                transparent snapshot of public open-source activity, grouped by
                the country listed on each GitHub profile.
              </p>
            </div>

            <div className="divide-y divide-border border-y border-border">
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
                  title: "Updated daily",
                  body: `Country indexes are refreshed every day from ${SOURCE_NAME} and enriched with public GitHub profile data.`,
                },
              ].map((item) => (
                <div
                  key={item.index}
                  className="grid grid-cols-[auto_1fr] gap-5 py-6 sm:gap-8"
                >
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {item.index}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-xs leading-5 text-muted-foreground">
                  Rankings are read from{" "}
                  <a
                    href={SOURCE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                  >
                    {SOURCE_NAME}
                  </a>
                  . Missing a country? Your GitHub location may need to be
                  public.
                </p>
                <Link
                  to="/"
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  Browse countries
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section> */}

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
