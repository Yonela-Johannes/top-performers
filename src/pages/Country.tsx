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
import {
  ArrowLeft,
  ArrowUpRight,
  GitCommit,
  Search,
  SearchX,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { getDynamicDescription, SEO_KEYWORDS } from "./constants";
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

const CountryLoading = () => (
  <div className="surface overflow-hidden" aria-busy="true" aria-live="polite">
    <div className="border-b border-border px-5 py-4">
      <div className="skeleton h-3 w-20" />
      <div className="mt-2 skeleton h-5 w-44" />
    </div>
    <div className="divide-y divide-border">
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

  const sortBy = (searchParams.get("sort") as SortOption) || "commits-desc";
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
    !isLoadingCountries && countries.length > 0 && slug && !country;
  const canFetch = Boolean(slug) && !countryMissing;

  const { data, error, isFetching, refetch } = useGetCountryUsersQuery(
    canFetch && slug ? { country: slug, mode: "commits" } : skipToken,
    { refetchOnMountOrArgChange: true, refetchOnFocus: false },
  );

  const users = useMemo(() => data?.users ?? [], [data]);
  const generatedAt = data?.generatedAt;

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
    data?.country?.name ||
    slug
      ?.split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") ||
    "";

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
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
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

  const currentYear = new Date().getFullYear();
  const totalCommits = users.reduce((sum, user) => sum + user.commits, 0);
  const leader = [...users].sort((a, b) => b.commits - a.commits)[0];
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
  const topTenUsers = filteredUsers.slice(0, 10);
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
      numberOfItems: filteredUsers.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: topTenUsers.map((user, index) => ({
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

  return (
    <div className="pb-20">
      <Helmet>
        <title>{titleText}</title>
        <meta name="keywords" content={keywordsText} />
        <meta name="description" content={descriptionText} />
        <meta name="author" content={SITE_OWNER} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={titleText} />
        <meta name="twitter:description" content={descriptionText} />
        <meta name="twitter:image" content={defaultOgImage} />
        <script type="application/ld+json">
          {JSON.stringify(countryStructuredData)}
        </script>
      </Helmet>

      <div className="shell">
        <div className="flex items-center gap-2 pb-8 pt-6 text-xs text-muted-foreground">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Countries
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate font-medium text-foreground">
            {formattedCountryName}
          </span>
        </div>

        <section className="notebook-surface relative -mx-5 border-b-2 border-foreground px-5 pb-8 pt-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-start gap-4 sm:items-center sm:gap-5">
            {country?.flagUrl ? (
              <img
                src={country.flagUrl}
                alt={`${formattedCountryName} flag`}
                className="h-11 w-16 shrink-0 rounded-lg border-2 border-foreground object-cover shadow-[2px_2px_0_var(--ink)] sm:h-14 sm:w-20"
              />
            ) : (
              <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted font-mono text-xs text-muted-foreground sm:h-14 sm:w-20">
                {country?.slug.slice(0, 2).toUpperCase() || "—"}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow">
                  {region || "Country"} leaderboard
                </p>
                {generatedAt && (
                  <>
                    <span
                      className="h-1 w-1 rounded-full bg-border"
                      aria-hidden="true"
                    />
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Updated {formatDate(generatedAt)}
                    </p>
                  </>
                )}
              </div>
              <h1 className="mt-1 break-words font-display text-[clamp(2.75rem,8vw,5.75rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em] text-foreground">
                {formattedCountryName}
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              The most active open-source developers in{" "}
              {formattedCountryName}, ranked by public commit activity. Explore
              profiles, compare output, and see who is setting the pace.
            </p>
            <a
              href="#about-this-leaderboard"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              About this ranking
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border-2 border-foreground bg-foreground shadow-[4px_4px_0_var(--ink)] sm:grid-cols-3">
            {[
              {
                label: "Ranked developers",
                value: isFetching && users.length === 0 ? "—" : users.length,
                icon: Users,
              },
              {
                label: "Public commits",
                value:
                  isFetching && users.length === 0
                    ? "—"
                    : totalCommits.toLocaleString(),
                icon: GitCommit,
              },
              {
                label: "Country leader",
                value: leader?.username || "—",
                icon: Trophy,
                truncate: true,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 bg-card px-5 py-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <stat.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd
                    className={`stat-value mt-0.5 text-lg font-medium text-foreground ${
                      stat.truncate ? "truncate" : ""
                    }`}
                  >
                    {stat.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <div className="sticky top-16 z-20 -mx-5 border-y border-foreground bg-background/95 px-5 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="developer-search" className="sr-only">
                Search developers in {formattedCountryName}
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="developer-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={`Search developers in ${formattedCountryName}...`}
                autoComplete="off"
                className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-10 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-ring/20"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Clear developer search"
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

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 pt-7">
          <p className="eyebrow">
            {searchQuery ? "Search results" : "The leaderboard"}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {isFetching && users.length === 0
              ? "Loading…"
              : `${filteredUsers.length} ${
                  filteredUsers.length === 1 ? "developer" : "developers"
                }`}
          </p>
        </div>

        {isFetching && users.length === 0 ? (
          <CountryLoading />
        ) : error ? (
          <div className="space-y-4">
            <ErrorMessage
              title="Couldn't load this leaderboard"
              message="The ranking data is temporarily unavailable. Try refreshing, or return to the country index."
            />
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="button-primary"
              >
                Try again
              </button>
              <Link
                to="/"
                className="button-secondary"
              >
                All countries
              </Link>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="surface flex flex-col items-center px-6 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-foreground bg-brand/40">
              <SearchX className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {searchQuery ? "No developers found" : "No ranking data yet"}
            </h2>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              {searchQuery
                ? `Nobody in ${formattedCountryName} matches “${searchQuery}”. Try a different name or clear the search.`
                : `TopPerformers hasn't collected public activity for ${formattedCountryName} yet. Check back after the next daily refresh.`}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={clearSearch}
                className="button-secondary mt-5"
              >
                Clear search
              </button>
            ) : (
              <Link
                to="/"
                className="button-primary mt-5"
              >
                Browse other countries
              </Link>
            )}
          </div>
        ) : (
          <>
            <UserTable
              users={visibleUsers}
              countryName={formattedCountryName}
              countrySlug={slug}
            />

            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Showing {visibleUsers.length} of {filteredUsers.length}
              </p>
              {hasMoreUsers ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((prev) => prev + PAGE_SIZE)
                  }
                  className="button-secondary"
                >
                  Load more developers
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  End of the leaderboard
                </p>
              )}
            </div>

            <section
              id="about-this-leaderboard"
              className="mt-16 scroll-mt-24 border-t border-border pt-10 lg:mt-20"
            >
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <div>
                  <p className="eyebrow">Methodology</p>
                  <h2 className="mt-3 font-display text-3xl leading-[1.02] text-foreground sm:text-4xl">
                    What this leaderboard measures
                  </h2>
                </div>
                <div className="space-y-4 text-sm leading-6 text-muted-foreground">
                  <p>
                    This page lists developers whose public GitHub profiles
                    declare a location in {formattedCountryName}, ordered by
                    public commit activity. It is a snapshot of visible
                    open-source output, not a rating of skill, seniority, or
                    employability.
                  </p>
                  <p>
                    {SITE_DESCRIPTION} Rankings refresh once a day. A developer
                    can appear in a country ranking when their GitHub location
                    is public and their activity is visible.
                  </p>
                  <Link
                    to="/#how-it-works"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    Read how rankings are built
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  );
};

export default Country;
