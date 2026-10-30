import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Search, UserSearch } from "lucide-react";

import { useGetGitHubUserByUsernameQuery } from "@/api/githubApi";
import { useGetCountriesQuery } from "@/api/countriesApi";
import { useRankingLookupState } from "@/hooks/useRankingLookup";
import { accountAge, normalizeExternalUrl, relativeTime } from "@/lib/github";
import { absoluteUrl, SITE_NAME, toTitle } from "@/lib/seo";
import { Breadcrumbs, PageHeader } from "@/components/common/PageHeader";
import {
  Badge,
  Card,
  CardMessage,
  SkeletonBlock,
  StatTile,
} from "@/components/common/Card";

const Developers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [submitted, setSubmitted] = useState(initial.trim());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce typing into the URL so the result is shareable and back works.
  useEffect(() => {
    const handle = value.trim();
    if (handle === submitted) return undefined;
    const timer = window.setTimeout(() => {
      setSubmitted(handle);
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          if (handle) next.set("q", handle);
          else next.delete("q");
          return next;
        },
        { replace: true },
      );
    }, 450);
    return () => window.clearTimeout(timer);
  }, [value, submitted, setSearchParams]);

  const handle = submitted.replace(/^@/, "");
  const validHandle = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(
    handle,
  );

  const {
    data: user,
    isLoading,
    isError,
    isFetching,
  } = useGetGitHubUserByUsernameQuery(handle, { skip: !validHandle });

  const { ranking, isLookingUp, notRanked } = useRankingLookupState({
    username: handle,
    enabled: Boolean(handle),
  });

  const { data: countries = [] } = useGetCountriesQuery();

  // Only offered while a handle is still being typed; once GitHub resolves
  // one, the result card is the more relevant answer.
  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query || user) return [];
    return countries
      .filter((country) => country.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [countries, value, user]);

  const age = accountAge(user?.created_at);
  const site = normalizeExternalUrl(user?.blog);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = value.trim().replace(/^@/, "");
    if (!next) return;
    if (user && next.toLowerCase() === user.login.toLowerCase()) {
      navigate(`/developer/${encodeURIComponent(user.login)}`);
      return;
    }
    setSubmitted(next);
  };

  return (
    <div className="pb-20">
      <Helmet>
        <title>{toTitle("Find a developer")}</title>
        <meta
          name="description"
          content={`Search any GitHub handle on ${SITE_NAME} to see its ranking, repositories, languages and recent public activity.`}
        />
        <link rel="canonical" href={absoluteUrl("/developers")} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="shell">
        <Breadcrumbs
          className="pb-6 pt-6"
          items={[
            { label: "Countries", to: "/" },
            { label: "Explore", to: "/explore" },
            { label: "Find a developer" },
          ]}
        />

        <PageHeader
          eyebrow="Search"
          title={
            <>
              Look up a <span className="text-brand-ink">GitHub handle.</span>
            </>
          }
          description="Type a username to open its developer page: ranking from the commit index, live profile, repositories, languages and activity."
        />

        <div className="mx-auto mt-10 max-w-2xl">
          <form onSubmit={submit} role="search" className="relative">
            <label htmlFor="handle-search" className="sr-only">
              GitHub username
            </label>
            <UserSearch
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              id="handle-search"
              type="search"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="octocat"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="search"
              className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-32 text-base text-foreground shadow-[0_1px_2px_rgba(20,18,24,0.04)] outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-search-cancel-button]:appearance-none"
            />
            <button
              type="submit"
              className="button-primary absolute right-2 top-1/2 h-10 -translate-y-1/2"
              disabled={!validHandle}
            >
              Open
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          {handle && !validHandle ? (
            <p className="mt-2 text-xs text-[hsl(var(--danger-ink))]">
              GitHub handles are letters, numbers and single hyphens, up to 39
              characters.
            </p>
          ) : null}

          {isLoading || isFetching ? (
            <Card className="mt-4" aria-busy="true">
              <div className="flex items-center gap-4">
                <SkeletonBlock className="h-14 w-14 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-40" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
              </div>
              <p className="sr-only">Searching GitHub</p>
            </Card>
          ) : isError ? (
            <Card className="mt-4">
              <CardMessage
                icon={<Search />}
                title={`No GitHub account for @${handle}`}
                description="GitHub has no public profile at this handle. Check the spelling, or it may have been renamed."
              />
            </Card>
          ) : user ? (
            <Card className="mt-4" interactive>
              <div className="flex items-start gap-4">
                <img
                  src={user.avatar_url}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl border border-border bg-secondary object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-foreground">
                      {user.name || user.login}
                    </p>
                    {ranking ? (
                      <Badge tone="brand">
                        #{ranking.committer.rank} · {ranking.countryName}
                      </Badge>
                    ) : notRanked ? (
                      <Badge tone="neutral">Not in the index</Badge>
                    ) : isLookingUp ? (
                      <Badge tone="neutral">Checking index…</Badge>
                    ) : null}
                  </div>
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
                  >
                    @{user.login}
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                  {user.bio ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-secondary">
                      {user.bio}
                    </p>
                  ) : null}
                  {site ? (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {site.replace(/^https?:\/\//, "")}
                    </p>
                  ) : null}
                </div>
                <Link
                  to={`/developer/${encodeURIComponent(user.login)}${
                    ranking ? `?from=${ranking.countrySlug}` : ""
                  }`}
                  className="button-primary shrink-0"
                >
                  Open page
                </Link>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatTile
                  label="Followers"
                  value={user.followers.toLocaleString()}
                />
                <StatTile
                  label="Repositories"
                  value={user.public_repos.toLocaleString()}
                />
                <StatTile
                  label="Joined"
                  value={age ? age.joined.getFullYear() : "—"}
                />
                <StatTile
                  label="Last seen"
                  value={relativeTime(user.created_at)}
                  hint="GitHub account created"
                />
              </dl>
            </Card>
          ) : suggestions.length > 0 ? (
            <Card tone="muted" className="mt-4">
              <p className="card-label">Countries matching “{value.trim()}”</p>
              <ul className="mt-2 divide-y divide-border">
                {suggestions.map((country) => (
                  <li key={country.slug}>
                    <Link
                      to={`/${country.slug}`}
                      className="flex items-center gap-3 py-2.5 text-sm text-foreground hover:text-brand-ink"
                    >
                      <img
                        src={country.flagUrl}
                        alt=""
                        className="h-4 w-6 rounded-sm object-cover"
                      />
                      <span className="flex-1 truncate">{country.name}</span>
                      <ArrowUpRight
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <div className="mt-10 rounded-xl border border-dashed border-border px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                Start with a handle
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                Any public GitHub username works — try{" "}
                <button
                  type="button"
                  onClick={() => setValue("sindresorhus")}
                  className="font-medium text-brand-ink underline underline-offset-4"
                >
                  sindresorhus
                </button>
                , or browse the{" "}
                <Link
                  to="/explore"
                  className="font-medium text-brand-ink underline underline-offset-4"
                >
                  country directory
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Developers;
