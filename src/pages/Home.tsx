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
import {
  useGetCountriesQuery,
  useGetMetadataQuery,
} from "@/api/countriesApi";
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
  SOURCE_NAME,
  SOURCE_URL,
  toTitle,
} from "@/lib/seo";

const COUNTRIES_PER_PAGE = 18;
const REGION_ORDER = ["Africa", "Americas", "Asia", "Europe", "Oceania", "Other"];
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

    return REGION_ORDER.filter((region) => counts.has(region)).map((region) => ({
      name: region,
      count: counts.get(region) || 0,
    }));
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
        <section className="pb-10 pt-12 sm:pt-14 lg:pb-14 lg:pt-20">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-ink" />
            <p className="eyebrow text-foreground/70">
              The open-source performance index
            </p>
            <span className="hidden h-px w-8 bg-border sm:block" aria-hidden="true" />
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
              Updated daily
            </span>
          </div>

          <div className="mt-5 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
            <div className="max-w-3xl">
              <h1 className="font-display text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.94] tracking-[-0.015em] text-foreground">
                The world's most active{" "}
                <span className="italic text-brand-ink">builders</span>,
                <br className="hidden sm:block" /> ranked by country.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                A clear view of the developers shipping the most public code —
                country by country, refreshed every day from public GitHub
                activity.
              </p>
            </div>

            <div className="hidden w-56 border-l border-border pl-6 lg:block">
              <p className="eyebrow">The index</p>
              <p className="mt-3 font-display text-4xl leading-none text-foreground">
                {isLoadingCountries ? "—" : allCountries.length}
                <span className="ml-2 font-sans text-sm font-medium text-muted-foreground">
                  countries
                </span>
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Ranked by public commits, updated daily.
              </p>
              <a
                href="#how-it-works"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                How it works
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            {[
              {
                label: "Countries tracked",
                value: isLoadingCountries ? "—" : allCountries.length,
              },
              {
                label: "Regions covered",
                value: isLoadingCountries ? "—" : regionOptions.length,
              },
              {
                label: "Ranking metric",
                value: "Commits",
              },
              {
                label: "Last updated",
                value: formatDate(metadata?.generatedAt),
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-card px-4 py-3.5 sm:px-5">
                <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="stat-value mt-1 text-lg font-medium text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="explore-heading">
          <div className="sticky top-16 z-30 -mx-5 border-y border-border bg-background/90 px-5 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative min-w-0 flex-1">
                <label htmlFor="country-search" className="sr-only">
                  Search countries
                </label>
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="country-search"
                  type="search"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search a country..."
                  autoComplete="off"
                  className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-10 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-ring/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={toggleSort}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-foreground/25 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Sort countries ${sortOrder === "asc" ? "Z to A" : "A to Z"}`}
              >
                {sortOrder === "asc" ? (
                  <ArrowDownAZ className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ArrowUpAZ className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="hidden font-mono text-[11px] uppercase tracking-[0.1em] sm:inline">
                  {sortOrder === "asc" ? "A–Z" : "Z–A"}
                </span>
              </button>
            </div>

            <div
              className="no-scrollbar -mb-0.5 mt-3 flex snap-x items-center gap-1.5 overflow-x-auto pb-0.5"
              role="group"
              aria-label="Filter by region"
            >
              <button
                type="button"
                onClick={() => selectRegion("All")}
                aria-pressed={activeRegion === "All"}
                className={`shrink-0 snap-start rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeRegion === "All"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                }`}
              >
                All regions
                <span className="ml-1.5 font-mono text-[10px] opacity-60">
                  {allCountries.length || ""}
                </span>
              </button>
              {regionOptions.map((region) => (
                <button
                  key={region.name}
                  type="button"
                  onClick={() => selectRegion(region.name)}
                  aria-pressed={activeRegion === region.name}
                  className={`shrink-0 snap-start rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeRegion === region.name
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                  }`}
                >
                  {region.name}
                  <span className="ml-1.5 font-mono text-[10px] opacity-60">
                    {region.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3 pb-5 pt-8">
            <div>
              <p className="eyebrow">Countries</p>
              <h2
                id="explore-heading"
                className="mt-1 font-display text-3xl leading-none text-foreground sm:text-4xl"
              >
                {activeRegion === "All" ? "Explore the index" : activeRegion}
              </h2>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {isLoadingCountries
                ? "Loading…"
                : `${filteredCountries.length} ${
                    filteredCountries.length === 1 ? "country" : "countries"
                  }`}
            </p>
          </div>

          {countriesError ? (
            <div className="surface flex flex-col items-center px-6 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <ServerCrash
                  className="h-5 w-5 text-destructive"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                The index couldn't load
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                The country data is temporarily unavailable. Check your
                connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetchCountries()}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                <Loader2 className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
            </div>
          ) : isLoadingCountries ? (
            <HomeLoading />
          ) : filteredCountries.length === 0 ? (
            <div className="surface flex flex-col items-center px-6 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No countries found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {search
                  ? `Nothing matches “${search}”${
                      activeRegion !== "All" ? ` in ${activeRegion}` : ""
                    }. Try a different spelling or clear the filters.`
                  : "No countries are available in this region yet."}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCountries.map((country) => (
                  <CountryCard
                    key={country.slug}
                    country={country}
                    region={countryToRegion[country.name.toLowerCase()]}
                    onUserClick={setSelectedUser}
                  />
                ))}
              </div>

              {hasMoreCountries && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((prev) => prev + COUNTRIES_PER_PAGE)
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-foreground/25 hover:bg-secondary"
                  >
                    Load more countries
                    <ArrowDownAZ className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Showing {visibleCountries.length} of{" "}
                    {filteredCountries.length}
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        <section
          id="how-it-works"
          className="mt-20 scroll-mt-24 border-t border-border pt-12 lg:mt-24 lg:pt-16"
        >
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-ink" aria-hidden="true" />
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
