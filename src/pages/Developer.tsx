import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarDays, Trophy } from "lucide-react";

import {
  classifyGithubError,
  useGetGitHubEventsQuery,
  useGetGitHubFollowersQuery,
  useGetGitHubGistsQuery,
  useGetGitHubReposQuery,
  useGetGitHubUserByUsernameQuery,
  useGetRateLimitQuery,
  type RepoSort,
} from "@/api/githubApi";
import { useGetCountriesQuery, useGetMetadataQuery } from "@/api/countriesApi";
import { useRepoLanguages } from "@/hooks/useRepoLanguages";
import { useRankingLookupState } from "@/hooks/useRankingLookup";
import {
  accountAge,
  countrySlugToTerm,
  eventCoverageDays,
  relativeTime,
} from "@/lib/github";
import { formatDate } from "@/lib/format";
import { absoluteUrl, SITE_NAME, toTitle } from "@/lib/seo";
import { ProfileCard } from "@/components/github/ProfileCard";
import { RepoSection } from "@/components/github/RepoSection";
import { ActivityCard } from "@/components/github/ActivityCard";
import { LanguageBreakdown } from "@/components/github/LanguageBreakdown";
import { GistsCard } from "@/components/github/GistsCard";
import { GithubErrorState } from "@/components/github/GithubErrorState";
import { Breadcrumbs } from "@/components/common/PageHeader";
import { Card, CardHeader, SkeletonBlock } from "@/components/common/Card";

/** Repositories shown before "show all". */
const REPO_LIMIT = 8;
/** The larger page requested on demand when the person opens "show all". */
const REPO_FULL = 60;

export const Developer = () => {
  const { username = "" } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const decodedUsername = decodeURIComponent(username);
  const fromCountry = searchParams.get("from") ?? undefined;

  const [reposPerPage, setReposPerPage] = useState(REPO_LIMIT);
  const [repoSort, setRepoSort] = useState<RepoSort>("pushed");

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUser,
    isFetching: isUserFetching,
  } = useGetGitHubUserByUsernameQuery(decodedUsername, {
    skip: !decodedUsername,
    refetchOnMountOrArgChange: false,
  });

  const failure = isUserError ? classifyGithubError(userError) : null;

  const skipSecondary = !decodedUsername || Boolean(failure);

  const {
    data: repos = [],
    isLoading: isReposLoading,
    isError: isReposError,
    refetch: refetchRepos,
  } = useGetGitHubReposQuery(
    { username: decodedUsername, perPage: reposPerPage, sort: repoSort },
    { skip: skipSecondary },
  );

  const {
    data: events,
    isLoading: isEventsLoading,
    isError: isEventsError,
  } = useGetGitHubEventsQuery(
    { username: decodedUsername, perPage: 100 },
    { skip: skipSecondary },
  );

  const {
    data: followers = [],
    isLoading: isFollowersLoading,
  } = useGetGitHubFollowersQuery(
    { username: decodedUsername, perPage: 12 },
    { skip: skipSecondary },
  );

  const {
    data: gists = [],
    isLoading: isGistsLoading,
    isError: isGistsError,
  } = useGetGitHubGistsQuery(
    { username: decodedUsername, perPage: 6 },
    { skip: skipSecondary },
  );

  // Language inventories for the first few repositories — fixed hook slots, so
  // the sample changing cannot reorder hooks.
  const { byRepo: languagesByRepo, isLoading: languagesLoading } =
    useRepoLanguages(repos);

  const { data: countries = [] } = useGetCountriesQuery();
  const { data: metadata } = useGetMetadataQuery();

  // The GitHub profile is authoritative for where this developer actually is;
  // the `from` slug is only a first guess. Reordering the scan queue by the
  // profile's own location finds the hit before fetching most of the index.
  const locationTerm = countrySlugToTerm(fromCountry);
  const locationSlug = useMemo(() => {
    const location = user?.location?.toLowerCase();
    if (!location) return locationTerm ? fromCountry : undefined;
    return (
      countries.find((country) => location.includes(country.name.toLowerCase()))
        ?.slug ?? (locationTerm ? fromCountry : undefined)
    );
  }, [countries, user?.location, fromCountry, locationTerm]);

  // The ranking lives in the country files, so it is located by scanning them
  // rather than by an API call. The profile's own location decides which
  // country is checked first; `from` only seeds that when the profile has no
  // usable location.
  const { ranking, isLookingUp, notRanked } = useRankingLookupState({
    username: decodedUsername,
    preferredSlug: locationSlug,
  });

  // Only asked for when the quota is the likely cause, so a normal visit
  // never spends a request on it.
  const { data: rateLimit } = useGetRateLimitQuery(undefined, {
    skip: failure !== "rate-limited",
  });

  const pageUrl = absoluteUrl(
    `/developer/${encodeURIComponent(decodedUsername)}`,
  );
  const age = accountAge(user?.created_at);

  const structuredData = user
    ? {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: user.name || user.login,
          alternateName: user.login,
          description: user.bio || undefined,
          image: user.avatar_url,
          url: user.html_url,
          sameAs: [user.html_url],
          worksFor: user.company
            ? { "@type": "Organization", name: user.company.replace(/^@/, "") }
            : undefined,
          homeLocation: user.location
            ? { "@type": "Place", name: user.location }
            : undefined,
        },
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: absoluteUrl("/"),
        },
      }
    : null;

  return (
    <div className="pb-20">
      <Helmet>
        <title>
          {toTitle(
            `${user?.name || decodedUsername} (@${decodedUsername}) — developer profile`,
          )}
        </title>
        <meta
          name="description"
          content={
            user?.bio ||
            `${user?.name || decodedUsername}'s GitHub profile — repositories, languages and recent public activity.`
          }
        />
        <link rel="canonical" href={pageUrl} />
        <meta
          name="robots"
          content={
            failure === "not-found" ? "noindex, follow" : "index, follow"
          }
        />
        <meta property="og:type" content="profile" />
        <meta
          property="og:title"
          content={`${user?.name || decodedUsername} on TopPerformers`}
        />
        <meta property="og:url" content={pageUrl} />
        <meta
          property="og:image"
          content={user?.avatar_url || absoluteUrl("/og-image.png")}
        />
        {structuredData ? (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        ) : null}
      </Helmet>

      <div className="shell">
        <Breadcrumbs
          className="pb-6 pt-6"
          items={[
            {
              label: "Countries",
              to: "/",
              icon: <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />,
            },
            { label: "Developer", to: "/explore" },
            { label: `@${decodedUsername}` },
          ]}
        />

        {failure ? (
          <GithubErrorState
            kind={failure}
            onRetry={() => refetchUser()}
            isRetrying={isUserFetching}
            resetAt={rateLimit?.resources.core.reset}
          >
            <Link to="/" className="button-secondary">
              Browse countries
            </Link>
            <Link to="/explore" className="button-secondary">
              Explore developers
            </Link>
          </GithubErrorState>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-8">
                <ProfileCard
                  username={decodedUsername}
                  user={user}
                  repos={repos}
                  followers={followers}
                  isLoading={isUserLoading}
                  isFollowersLoading={isFollowersLoading}
                  ranking={
                    ranking
                      ? {
                          rank: ranking.committer.rank,
                          commits: ranking.committer.commits,
                          countryName: ranking.countryName,
                          countrySlug: ranking.countrySlug,
                          flagUrl: ranking.flagUrl,
                        }
                      : undefined
                  }
                />

                <RepoSection
                  repos={repos}
                  totalRepos={user?.public_repos}
                  handle={user?.login || decodedUsername}
                  sort={repoSort}
                  onSortChange={(next) => {
                    setRepoSort(next);
                    setReposPerPage(REPO_LIMIT);
                  }}
                  showAll={reposPerPage > REPO_LIMIT}
                  onToggleShowAll={() =>
                    setReposPerPage((current) =>
                      current > REPO_LIMIT ? REPO_LIMIT : REPO_FULL,
                    )
                  }
                  limit={REPO_LIMIT}
                  isLoading={isReposLoading}
                  isError={isReposError}
                  onRetry={() => refetchRepos()}
                />
              </div>

              <aside className="min-w-0 space-y-5">
                <ActivityCard
                  events={events}
                  isLoading={isEventsLoading}
                  isError={isEventsError}
                  coverageDays={eventCoverageDays(events)}
                />

                <LanguageBreakdown
                  repos={repos}
                  languagesByRepo={languagesByRepo}
                  isLoading={isReposLoading || languagesLoading}
                />

                <GistsCard
                  gists={gists}
                  isLoading={isGistsLoading}
                  isError={isGistsError}
                  handle={user?.login || decodedUsername}
                />

                <Card>
                  <CardHeader
                    eyebrow="Account"
                    title="At a glance"
                    icon={<CalendarDays />}
                  />
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">
                        Public repositories
                      </dt>
                      <dd className="stat-value font-medium text-foreground">
                        {(user?.public_repos ?? 0).toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Public gists</dt>
                      <dd className="stat-value font-medium text-foreground">
                        {(user?.public_gists ?? 0).toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">On GitHub since</dt>
                      <dd className="font-medium text-foreground">
                        {age ? age.joined.getFullYear() : "—"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">
                        Most recent push
                      </dt>
                      <dd className="font-medium text-foreground">
                        {repos[0]?.pushed_at
                          ? relativeTime(repos[0].pushed_at)
                          : "—"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">
                        Countries indexed
                      </dt>
                      <dd className="stat-value font-medium text-foreground">
                        {countries.length}
                      </dd>
                    </div>
                    {metadata?.generatedAt ? (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Index updated</dt>
                        <dd className="font-medium text-foreground">
                          {formatDate(metadata.generatedAt)}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  {isUserLoading ? (
                    <div className="mt-4">
                      <SkeletonBlock className="h-3 w-full" />
                    </div>
                  ) : null}
                </Card>

                <Card>
                  <CardHeader
                    eyebrow="Ranking"
                    title="Commit index"
                    icon={<Trophy />}
                  />
                  {ranking ? (
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Country</dt>
                        <dd className="font-medium text-foreground">
                          {ranking.countryName}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Rank</dt>
                        <dd className="stat-value font-medium text-foreground">
                          #{ranking.committer.rank}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">
                          Public commits
                        </dt>
                        <dd className="stat-value font-medium text-foreground">
                          {ranking.committer.commits.toLocaleString()}
                        </dd>
                      </div>
                      <div className="pt-1">
                        <Link
                          to={`/${ranking.countrySlug}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline"
                        >
                          Open {ranking.countryName} leaderboard
                          <ArrowUpRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </dl>
                  ) : isLookingUp ? (
                    <div className="mt-4 space-y-2" aria-busy="true">
                      <SkeletonBlock className="h-3 w-2/3" />
                      <SkeletonBlock className="h-3 w-1/2" />
                      <p className="sr-only">
                        Checking the commit index for this developer
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {notRanked
                        ? `@${decodedUsername} isn’t in the current commit index. Only developers whose GitHub profile lists a public country are ranked.`
                        : "The commit index hasn’t been checked yet."}
                    </p>
                  )}
                </Card>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Developer;
