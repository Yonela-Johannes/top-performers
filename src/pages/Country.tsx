import { useEffect, useMemo, useState } from "react";
import type { SortOption } from "@/types";
import { Helmet } from "react-helmet-async";
import { ErrorMessage, FilterBar, UserTable } from "@/components/common";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useGetCountryUsersQuery } from "@/api";
import { useGetCountriesQuery } from "@/api/countriesApi";
import { useGetFlagsQuery } from "@/api/flagsApi";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Stamp, RegionBadge, RouteLine, LanternIllustration } from "@/components/atlas";
import { regionTheme } from "@/lib/regionTheme";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Globe,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { getDynamicDescription, SEO_KEYWORDS } from "./constants";
import {
  buildCountryToRegion,
  getCountryRegion as getCountryRegionFromFlags,
  RESERVED_SLUGS,
} from "@/lib/countries";
import {
  absoluteUrl,
  defaultOgImage,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OWNER,
  SITE_URL,
  toTitle,
} from "@/lib/seo";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 25;
const DEFAULT_SORT: SortOption = "commits-desc";
// Add any other values your SortOption type allows.
const SORT_OPTIONS: SortOption[] = [
  "commits-desc",
  "commits-asc",
  "alphabetical-asc",
  "alphabetical-desc",
];

const inlineLink =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline decoration-2 decoration-[var(--tangerine)] underline-offset-4 transition-colors hover:decoration-foreground";

const SkeletonValue = ({ className = "" }: { className?: string }) => (
  <span aria-hidden="true" className={`skeleton block ${className}`} />
);

const CountryFlag = ({
  src,
  className = "",
}: {
  src?: string;
  className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  const base = `shrink-0 rounded-lg border-2 border-foreground ${className}`;

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`${base} flex items-center justify-center bg-surface-muted text-foreground`}
      >
        <Globe className="h-5 w-5" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className={`${base} object-cover shadow-[2px_2px_0_var(--ink)]`}
    />
  );
};

const CountryLoading = () => (
  <div role="status" aria-busy="true" className="surface overflow-hidden">
    <div className="border-b-2 border-foreground px-5 py-4">
      <div className="skeleton h-3 w-20" />
      <div className="mt-2 skeleton h-5 w-44" />
    </div>
    <div className="divide-y-2 divide-dashed divide-foreground/25">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <div className="skeleton h-7 w-7" />
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-32" />
            <div className="skeleton h-2.5 w-24" />
          </div>
          <div className="skeleton h-3.5 w-14" />
        </div>
      ))}
    </div>
    <p className="sr-only">Loading the country leaderboard</p>
  </div>
);

const Country = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawSort = searchParams.get("sort");
  const sortBy: SortOption = SORT_OPTIONS.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : DEFAULT_SORT;
  const searchQuery = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: countries = [], isLoading: isLoadingCountries } =
    useGetCountriesQuery();
  const { data: flagsData = [] } = useGetFlagsQuery();

  const country = useMemo(
    () => countries.find((item) => item.slug === slug),
    [countries, slug],
  );
  const region = useMemo(() => {
    if (!country) return undefined;
    return flagsData.find(
      (flag) => flag.name.toLowerCase() === country.name.toLowerCase(),
    )?.continent;
  }, [country, flagsData]);

  const countryMissing =
    !isLoadingCountries &&
    countries.length > 0 &&
    slug &&
    (!country || RESERVED_SLUGS.has(slug.toLowerCase()));
  const canFetch = Boolean(slug) && !countryMissing;

  // currentData (not data): `data` keeps the previous country's result
  // while the next one loads, which showed stale developers.
  const { currentData, error, isFetching, refetch } = useGetCountryUsersQuery(
    canFetch && slug ? { country: slug, mode: "commits" } : skipToken,
    { refetchOnMountOrArgChange: true, refetchOnFocus: false },
  );

  const users = useMemo(() => currentData?.users ?? [], [currentData]);
  const generatedAt = currentData?.generatedAt;
  const isInitialLoad = isFetching && !currentData;
  const hasLoadError = Boolean(error);

  // One commit-ranked list feeds the leader, the totals and the JSON-LD.
  // It's a hook, so it has to stay above the early returns.
  const { rankedUsers, totalCommits } = useMemo(() => {
    const ranked = [...users].sort((a, b) => b.commits - a.commits);
    return {
      rankedUsers: ranked,
      totalCommits: ranked.reduce((sum, user) => sum + user.commits, 0),
    };
  }, [users]);
  const leader = rankedUsers[0];

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortBy, searchQuery, slug]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (searchInput === searchQuery) return;
    const timeout = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams);
      if (searchInput.trim()) nextParams.set("search", searchInput.trim());
      else nextParams.delete("search");
      setSearchParams(nextParams, { replace: true });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput, searchQuery, searchParams, setSearchParams]);

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          (user.realname || "").toLowerCase().includes(query),
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical-asc":
          return a.username.localeCompare(b.username);
        case "alphabetical-desc":
          return b.username.localeCompare(a.username);
        case "commits-asc":
          return a.commits - b.commits;
        case "commits-desc":
        default:
          return b.commits - a.commits;
      }
    });

    return result;
  }, [users, searchQuery, sortBy]);

  const visibleUsers = useMemo(
    () => filteredUsers.slice(0, visibleCount),
    [filteredUsers, visibleCount],
  );
  const hasMoreUsers = visibleCount < filteredUsers.length;

  useInfiniteScroll({
    isLoading: isFetching,
    hasMore: hasMoreUsers,
    onLoadMore: () => setVisibleCount((prev) => prev + PAGE_SIZE),
    threshold: 480,
  });

  const clearSearch = () => {
    setSearchInput("");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    setSearchParams(nextParams, { replace: true });
  };

  const formattedCountryName =
    country?.name ||
    currentData?.country?.name ||
    (slug
      ? slug
          .split(/[-_]/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "");

  // "More in <Region>": the next countries in the same region by indexed
  // position in the country list (deterministic, from real data). Excludes the
  // current country; falls back to wrapping around the region's list.
  const moreInRegion = useMemo(() => {
    if (!country || !region) return [];
    const regionMap = buildCountryToRegion(flagsData);
    const inRegion = countries.filter(
      (item) =>
        item.slug !== country.slug &&
        getCountryRegionFromFlags(regionMap, item.name) === region,
    );
    const startIndex = inRegion.findIndex((item) => item.name > country.name);
    const ordered =
      startIndex >= 0
        ? [...inRegion.slice(startIndex), ...inRegion.slice(0, startIndex)]
        : inRegion;
    return ordered.slice(0, 4);
  }, [country, region, countries, flagsData]);

  if (!slug) {
    return (
      <div className="shell py-20">
        <ErrorMessage
          title="Country not found"
          message="This leaderboard link is missing a country."
        />
      </div>
    );
  }

  if (countryMissing) {
    return (
      <div className="shell py-20">
        <Helmet>
          <title>{toTitle("Country not found")}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="surface mx-auto max-w-md px-6 py-10 text-center">
          <p className="stamp-badge mx-auto inline-flex">404 · Not indexed</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
            That country isn't indexed
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground/80">
            TopPerformers currently tracks {countries.length} countries and
            regions. Browse the index to find an available leaderboard.
          </p>
          <Link to="/" className="button-primary mt-6">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to countries
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- SEO ---------- */
  const currentYear = new Date().getFullYear();
  const titleText = toTitle(
    `Top developers in ${formattedCountryName} (${currentYear})`,
  );
  const descriptionText = getDynamicDescription(
    formattedCountryName,
    users.length,
    currentYear,
  );
  const keywordsText = [
    ...SEO_KEYWORDS.map((keyword) => `${keyword} in ${formattedCountryName}`),
    `${formattedCountryName} developer leaderboard`,
    `top programmers ${formattedCountryName}`,
    `GitHub ranking ${formattedCountryName}`,
  ].join(", ");
  const pageUrl = absoluteUrl(`/${slug}`);
  // Search and sort variants share one canonical URL, so keep them out of the index.
  const isFilteredView = Boolean(searchQuery) || sortBy !== DEFAULT_SORT;
  const countryStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: titleText,
      description: descriptionText,
      url: pageUrl,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      author: {
        "@type": "Person",
        name: SITE_OWNER,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Countries",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: formattedCountryName,
            item: pageUrl,
          },
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Top developers in ${formattedCountryName}`,
      description: descriptionText,
      // Always the commit-ranked list, never the search/sort-filtered one.
      numberOfItems: users.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: rankedUsers.slice(0, 10).map((user, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: user.profile,
        name: user.realname || user.username,
        item: {
          "@type": "Person",
          name: user.realname || user.username,
          alternateName: user.username,
          url: user.profile,
          image: user.avatar,
        },
      })),
    },
  ];

  const stats = [
    { label: "Ranked developers", value: users.length.toLocaleString() },
    { label: "Public commits", value: totalCommits.toLocaleString() },
    {
      label: "Most commits",
      isName: true,
      value: leader ? (
        <a
          href={leader.profile}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-2 decoration-[var(--tangerine)] underline-offset-4 hover:decoration-foreground"
        >
          {leader.username}
          <span className="sr-only"> (opens GitHub profile)</span>
        </a>
      ) : (
        "—"
      ),
    },
  ];

  return (
    <div className="pb-20">
      <Helmet>
        <title>{titleText}</title>
        <meta name="keywords" content={keywordsText} />
        <meta name="description" content={descriptionText} />
        <meta name="author" content={SITE_OWNER} />
        <meta
          name="robots"
          content={
            isFilteredView
              ? "noindex, follow"
              : "index, follow, max-image-preview:large"
          }
        />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={titleText} />
        <meta property="og:description" content={descriptionText} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={defaultOgImage} />
        <meta
          property="og:image:alt"
          content={`Top developers in ${formattedCountryName}`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={titleText} />
        <meta name="twitter:description" content={descriptionText} />
        <meta name="twitter:image" content={defaultOgImage} />
        <meta
          name="twitter:image:alt"
          content={`Top developers in ${formattedCountryName}`}
        />
        <script type="application/ld+json">
          {JSON.stringify(countryStructuredData)}
        </script>
      </Helmet>

      <div className="shell">
        <nav aria-label="Breadcrumb" className="pb-8 pt-6">
          <ol className="flex items-center gap-2 text-sm text-foreground/80">
            <li>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-md font-medium underline-offset-4 hover:text-foreground hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                World index
              </Link>
            </li>
            {region && (
              <>
                <li aria-hidden="true">/</li>
                <li
                  aria-current="location"
                  className="hidden truncate font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground sm:block"
                >
                  {region}
                </li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li
              aria-current="page"
              className="truncate font-semibold text-foreground"
            >
              {formattedCountryName}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <section
          aria-labelledby="country-heading"
          className="notebook-surface relative -mx-5 border-b border-border px-5 pb-10 pt-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            {/* key resets the failed-image state when navigating between countries */}
            <CountryFlag
              key={country?.flagUrl}
              src={country?.flagUrl}
              className="h-11 w-16 sm:h-14 sm:w-20"
            />
            <div className="min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <RegionBadge region={region} />
              {generatedAt && (
                  <Stamp
                    country={formattedCountryName}
                    region={region}
                    date={formatDate(generatedAt)}
                  />
                )}
              </div>
              <h1
                id="country-heading"
                className="mt-1 break-words font-display text-[clamp(2.25rem,8vw,5.25rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-foreground"
              >
                {formattedCountryName}
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <p className="max-w-2xl text-base leading-7 text-foreground/80">
              Developers in {formattedCountryName}, ranked by public commit
              activity on GitHub. It’s a snapshot of visible open-source work,
              not a measure of skill or impact.
            </p>
            <a href="#about-this-leaderboard" className={`${inlineLink} shrink-0`}>
              About this ranking
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-1 divide-y-2 divide-dashed divide-foreground/25 border-t-[3px] border-foreground sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0 py-4 sm:px-6 sm:first:pl-0">
                <dt className="font-mono text-xs uppercase tracking-[0.08em] text-foreground/70">
                  {stat.label}
                </dt>
                <dd
                  className={`mt-1.5 text-foreground ${
                    stat.isName
                      ? "truncate font-sans text-2xl font-bold sm:text-3xl"
                      : "font-display text-3xl leading-none sm:text-4xl"
                  }`}
                >
                  {isInitialLoad ? (
                    <SkeletonValue className="h-8 w-24" />
                  ) : currentData ? (
                    stat.value
                  ) : (
                    <>
                      —<span className="sr-only"> unavailable</span>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Toolbar */}
        <div
          className="sticky z-20 -mx-5 border-y border-border bg-background/95 px-5 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          style={{ top: "var(--nav-height)" }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="developer-search" className="sr-only">
                Search developers in {formattedCountryName}
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/70"
                aria-hidden="true"
              />
              <input
                id="developer-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name or username"
                autoComplete="off"
                className="h-11 w-full rounded-xl border-2 border-foreground bg-card pl-10 pr-11 text-base text-foreground shadow-[2px_2px_0_var(--ink)] outline-none placeholder:text-foreground/60 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)] [&::-webkit-search-cancel-button]:appearance-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear developer search"
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <FilterBar
              sortBy={sortBy}
              isFetching={isFetching}
              refetch={refetch}
            />
          </div>
        </div>

        {/* List header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 pt-8">
          <h2 className="eyebrow">
            {searchQuery ? "Search results" : "The leaderboard"}
          </h2>
          <p
            role="status"
            className="font-mono text-xs uppercase tracking-[0.08em] text-foreground/70"
          >
            {isInitialLoad
              ? "Loading…"
              : searchQuery
                ? `${filteredUsers.length} of ${users.length} developers`
                : `${users.length} ${users.length === 1 ? "developer" : "developers"}`}
          </p>
        </div>

        {isInitialLoad ? (
          <CountryLoading />
        ) : hasLoadError && !currentData ? (
          <div className="space-y-4">
            <ErrorMessage
              title="Couldn't load this leaderboard"
              message="The ranking data is temporarily unavailable. Try again, or return to the country index."
            />
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="button-primary"
              >
                Try again
              </button>
              <Link to="/" className="button-secondary">
                All countries
              </Link>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="surface flex flex-col items-center px-6 py-20 text-center">
            {searchQuery ? (
              <div className="flex h-12 w-12 -rotate-3 items-center justify-center rounded-lg border-2 border-foreground bg-brand shadow-[2px_2px_0_var(--ink)]">
                <SearchX className="h-5 w-5 text-foreground" aria-hidden="true" />
              </div>
            ) : (
              <LanternIllustration className="bob" />
            )}
            <h2 className="mt-5 font-display text-3xl font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-foreground">
              {searchQuery ? "No developers found" : "Nothing recorded here yet"}
            </h2>
            <p className="mt-3 max-w-sm text-base leading-7 text-foreground/80">
              {searchQuery
                ? `Nobody in ${formattedCountryName} matches “${searchQuery}”. Try a different name or clear the search.`
                : `No public commit activity has been collected for ${formattedCountryName} in the current dataset. This is not an error — the page will fill in whenever the data pipeline records activity here.`}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={clearSearch}
                className="button-secondary mt-6"
              >
                Clear search
              </button>
            ) : (
              <Link to="/" className="button-primary mt-6">
                Browse other countries
              </Link>
            )}
          </div>
        ) : (
          <>
            {hasLoadError && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-foreground/40 bg-card px-4 py-3 text-sm text-foreground/80">
                <p>Couldn’t refresh. Showing the last data we loaded.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="button-secondary"
                >
                  Try again
                </button>
              </div>
            )}

            <UserTable
              users={visibleUsers}
              countryName={formattedCountryName}
              countrySlug={slug}
            />

            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-foreground/70">
                Showing {visibleUsers.length} of {filteredUsers.length}
              </p>
              {hasMoreUsers ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="button-secondary"
                >
                  Load more developers
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm text-foreground/70">
                  End of the leaderboard
                </p>
              )}
            </div>
          </>
        )}

        {/* Next stops: same region, deterministic order from the country list */}
        {moreInRegion.length > 0 && (
          <section aria-labelledby="next-stops-heading" className="mt-16 lg:mt-20">
            <div className="border-t-[3px] border-foreground pt-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Next stops</p>
                  <h2
                    id="next-stops-heading"
                    className="mt-2 font-display text-2xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground sm:text-3xl"
                  >
                    More in {region}.
                  </h2>
                  <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                    Other indexed destinations in {region}, listed in the same
                    order as the world index.
                  </p>
                </div>
                <RouteLine className="hidden h-10 max-w-xs lg:block" />
              </div>

              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {moreInRegion.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/${item.slug}`}
                      className="group flex min-h-16 items-center gap-3 rounded-xl border-2 border-foreground bg-card px-4 py-3 shadow-[3px_3px_0_var(--ink)] transition-[transform,box-shadow] hover:shadow-[5px_5px_0_var(--ink)] motion-safe:hover:-translate-x-px motion-safe:hover:-translate-y-px motion-reduce:transition-none focus-visible:outline-none focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-[color:var(--focus)]"
                    >
                      <span
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 rounded-full border-2 border-[var(--ink)]"
                        style={{ background: regionTheme(region).fill }}
                      />
                      <span className="min-w-0 flex-1 truncate font-display text-sm font-bold uppercase tracking-tight text-foreground">
                        {item.name}
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Always rendered so the "About this ranking" anchor never dead-ends */}
        <section
          id="about-this-leaderboard"
          className="mt-16 scroll-mt-[calc(var(--nav-height)+4rem)] border-t-[3px] border-foreground pt-10 lg:mt-20"
        >
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="eyebrow">Methodology</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-foreground sm:text-4xl">
                What this leaderboard measures
              </h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-foreground/80">
              <p>
                This page lists developers whose public GitHub profiles declare a
                location in {formattedCountryName}, ordered by public commit
                activity. It is a snapshot of visible open-source output, not a
                rating of skill, seniority, or employability.
              </p>
              <p>
                {SITE_DESCRIPTION} Rankings are regenerated whenever the data
                pipeline runs; the stamp at the top of this page shows the
                exact date of the current dataset. A developer can appear in a
                country ranking when their GitHub location is public and their
                activity is visible.
              </p>
              <Link to="/#how-it-works" className={inlineLink}>
                Read how rankings are built
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Country;