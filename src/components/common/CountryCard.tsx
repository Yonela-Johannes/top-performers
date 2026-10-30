import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetCountryUsersQuery } from "@/api";
import type { Committer } from "@/types";
import { ArrowUpRight, GitCommit, Globe, RotateCw } from "lucide-react";
import { formatCompactNumber } from "@/lib/format";
import { RegionBadge } from "@/components/atlas";
import { Card, SkeletonBlock } from "./Card";

interface CountryCardProps {
  country: { slug: string; name: string; flagUrl?: string };
  region?: string;
  onUserClick: (user: Committer) => void;
}

function Flag({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-[var(--surface-muted)] text-muted-foreground"
      >
        <Globe className="h-4 w-4" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={44}
      height={32}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-8 w-11 shrink-0 rounded-md border border-border object-cover"
    />
  );
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-[var(--surface-muted)] font-mono text-xs font-medium uppercase text-muted-foreground"
      >
        {name.slice(0, 1)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-7 w-7 shrink-0 rounded-full border border-border object-cover"
    />
  );
}

function StatValue({
  loading,
  error,
  children,
}: {
  loading: boolean;
  error: boolean;
  children: React.ReactNode;
}) {
  if (loading) return <SkeletonBlock className="h-6 w-14" />;
  if (error) {
    return (
      <>
        —<span className="sr-only">unavailable</span>
      </>
    );
  }
  return <>{children}</>;
}

/**
 * Country card.
 *
 * Same card language as repository, activity and profile cards: hairline
 * border, one tinted metric band, a quiet list. The title carries a stretched
 * link to the leaderboard, while each developer row is its own link to the
 * developer page — no nested interactive regions.
 */
export const CountryCard = ({
  country,
  region,
  onUserClick,
}: CountryCardProps) => {
  // Visibility-gated query: the full user list is only fetched once the card
  // scrolls into view (IntersectionObserver flips inView), not 30× on load.
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView]);

  const { currentData, isLoading, isError, refetch } = useGetCountryUsersQuery(
    inView ? { country: country.slug, mode: "all" } : skipToken,
  );

  const { topUsers, totalUsers, totalCommits, avgCommits } = (() => {
    const ranked = [...(currentData?.users ?? [])].sort(
      (a, b) => b.commits - a.commits,
    );
    const commits = ranked.reduce((sum, user) => sum + user.commits, 0);
    return {
      topUsers: ranked.slice(0, 3),
      totalUsers: ranked.length,
      totalCommits: commits,
      avgCommits: ranked.length ? Math.round(commits / ranked.length) : 0,
    };
  })();

  const isEmpty = !isLoading && !isError && inView && topUsers.length === 0;

  return (
    <Card
      as="article"
      ref={ref}
      interactive
      aria-busy={isLoading}
      className="h-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {isLoading ? (
            <SkeletonBlock className="h-8 w-11" />
          ) : (
            <Flag src={country.flagUrl} />
          )}
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-display text-xl font-extrabold uppercase leading-[0.95] tracking-[-0.01em]">
              {/* Stretched link: the ::after covers the whole card */}
              <Link
                to={`/${country.slug}`}
                className="text-foreground after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[3px] focus-visible:after:outline-[color:var(--focus)]"
              >
                {country.name}
                <span className="sr-only"> leaderboard</span>
              </Link>
            </h3>
            <RegionBadge region={region} className="mt-1 truncate" />
          </div>
        </div>

        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors group-hover:border-foreground/25 group-hover:text-foreground motion-reduce:transition-none"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Metrics */}
      <dl className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-[var(--surface-muted)] px-3 py-2.5">
          <dt className="card-label">Developers</dt>
          <dd className="stat-value mt-1 text-2xl font-semibold leading-none text-foreground">
            <StatValue loading={isLoading} error={isError}>
              {totalUsers.toLocaleString()}
            </StatValue>
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-[var(--surface-muted)] px-3 py-2.5">
          <dt className="card-label">Public commits</dt>
          <dd className="stat-value mt-1 text-2xl font-semibold leading-none text-foreground">
            <StatValue loading={isLoading} error={isError}>
              {formatCompactNumber(totalCommits)}
            </StatValue>
          </dd>
        </div>
      </dl>

      {/* Top performers */}
      <div className="mt-4 flex-1">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="card-label">Top performers</p>
          {!isLoading && !isError && totalUsers > 0 && (
            <span className="font-mono text-[11px] text-muted-foreground">
              {formatCompactNumber(avgCommits)} avg
            </span>
          )}
        </div>

        <ul
          className="space-y-0.5"
          aria-label={`Top performers in ${country.name}`}
        >
          {isLoading
            ? [0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-3 py-1.5">
                  <SkeletonBlock className="h-6 w-7" />
                  <SkeletonBlock className="h-7 w-7 rounded-full" />
                  <SkeletonBlock className="h-3.5 flex-1" />
                  <SkeletonBlock className="h-3.5 w-10" />
                </li>
              ))
            : topUsers.map((user, index) => (
                <li key={user.username}>
                  {/* relative z-10 lifts the link above the stretched title */}
                  <Link
                    to={`/developer/${encodeURIComponent(user.username)}?from=${country.slug}`}
                    onClick={() => onUserClick(user)}
                    className="relative z-10 flex min-h-10 w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                    aria-label={`Open the developer page for ${user.username}`}
                  >
                    <span
                      className={`flex h-6 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium ${
                        index === 0
                          ? "border border-brand/40 bg-brand-soft text-brand-soft-ink"
                          : "text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <Avatar src={user.avatar} name={user.username} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {user.username}
                    </span>
                    <span className="stat-value shrink-0 text-xs font-medium text-foreground">
                      {formatCompactNumber(user.commits)}
                      <span className="sr-only"> commits</span>
                    </span>
                  </Link>
                </li>
              ))}
        </ul>

        {isError && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-foreground/30 px-3 py-2.5 text-sm text-muted-foreground">
            <span>Couldn’t load rankings.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="relative z-10 inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-foreground/30 px-3 py-2.5 text-sm text-muted-foreground">
            <GitCommit className="h-4 w-4 shrink-0" aria-hidden="true" />
            No public commit data yet.
          </div>
        )}
      </div>
    </Card>
  );
};
