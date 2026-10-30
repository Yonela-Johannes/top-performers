import { useEffect, useMemo, useRef, useState } from "react";
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
        className="flex h-8 w-11 shrink-0 items-center justify-center border border-border bg-[var(--surface-muted)] text-muted-foreground"
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
      className="h-8 w-11 shrink-0 border border-border object-cover"
    />
  );
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-[var(--surface-muted)] font-mono text-xs font-medium uppercase text-muted-foreground"
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
      className="h-7 w-7 shrink-0 border border-border object-cover"
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

export const CountryCard = ({
  country,
  region,
  onUserClick,
}: CountryCardProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  // Content that is already on screen when the page settles must not wait for
  // a scroll: on phones, and on any page whose cards sit below the fold,
  // "in view" often never fires until the person scrolls away and back. A
  // short deadline promotes the card to eager loading, so a skeleton is never
  // permanent. It is a no-op for cards the observer catches first.
  useEffect(() => {
    if (inView) return undefined;
    const timer = window.setTimeout(() => setInView(true), 1200);
    return () => window.clearTimeout(timer);
  }, [inView]);

  useEffect(() => {
    if (inView) return undefined;
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      // Load roughly one screen ahead of the viewport.
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    const rect = element.getBoundingClientRect();
    const viewport = window.innerHeight || 0;
    if (rect.top < viewport + 600 && rect.bottom > -600) setInView(true);

    return () => observer.disconnect();
  }, [inView]);

  const { currentData, isFetching, isError, refetch } = useGetCountryUsersQuery(
    inView ? { country: country.slug, mode: "all" } : skipToken,
  );
  const isLoading = !isError && (isFetching || !currentData);

  const { topUsers, totalUsers, totalCommits, avgCommits } = useMemo(() => {
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
  }, [currentData]);

  const isEmpty = !isLoading && !isError && topUsers.length === 0;

  return (
    <Card
      as="article"
      ref={ref}
      interactive
      aria-busy={isLoading ? "true" : undefined}
      className="h-full flex-1"
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
                className="text-foreground after:absolute after:inset-0 after:focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[3px] focus-visible:after:outline-[color:var(--focus)]"
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
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-card text-muted-foreground transition-colors group-hover:border-foreground/25 group-hover:text-foreground motion-reduce:transition-none"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Metrics */}
      <dl className="mt-5 grid grid-cols-2 gap-2">
        <div className="border border-border bg-[var(--surface-muted)] px-3 py-2.5">
          <dt className="card-label">Developers</dt>
          <dd className="stat-value mt-1 text-2xl font-semibold leading-none text-foreground">
            <StatValue loading={isLoading} error={isError}>
              {totalUsers.toLocaleString()}
            </StatValue>
          </dd>
        </div>
        <div className="border border-border bg-[var(--surface-muted)] px-3 py-2.5">
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
                  <SkeletonBlock className="h-7 w-7" />
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
                    className="relative z-10 flex min-h-10 w-full items-center gap-3 px-1 py-1.5 text-left transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                    aria-label={`Open the developer page for ${user.username}`}
                  >
                    <span
                      className={`flex h-6 w-7 shrink-0 items-center justify-center font-mono text-xs font-semibold ${
                        index === 0
                          ? "border border-amber-500/40 bg-amber-400/20 text-amber-950"
                          : index === 1
                            ? "border border-slate-300 bg-slate-100 text-slate-800"
                            : "border border-amber-800/25 bg-amber-100/80 text-amber-900"
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
          <div className="flex items-center justify-between gap-3 border border-dashed border-foreground/30 px-3 py-2.5 text-sm text-muted-foreground">
            <span>Couldn’t load rankings.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="relative z-10 inline-flex min-h-9 shrink-0 items-center gap-1.5 border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="flex items-center gap-2 border border-dashed border-foreground/30 px-3 py-2.5 text-sm text-muted-foreground">
            <GitCommit className="h-4 w-4 shrink-0" aria-hidden="true" />
            No public commit data yet.
          </div>
        )}
      </div>
    </Card>
  );
};
