import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetCountryUsersQuery } from "@/api";
import type { Committer } from "@/types";
import { ArrowUpRight, GitCommit, Globe, RotateCw } from "lucide-react";
import { formatCompactNumber } from "@/lib/format";
import { RegionBadge } from "@/components/atlas";

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
        className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md border-2 border-foreground bg-surface-muted text-foreground"
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
      className="h-8 w-11 shrink-0 rounded-md border-2 border-foreground object-cover"
    />
  );
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-surface-muted font-mono text-xs font-medium uppercase text-foreground"
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
      className="h-7 w-7 shrink-0 rounded-full border-2 border-foreground object-cover"
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
  if (loading)
    return <span aria-hidden="true" className="skeleton block h-6 w-14" />;
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

  const { topUsers, totalUsers, totalCommits, avgCommits } = useMemo(() => {
    const users = currentData?.users ?? [];
    const commits = users.reduce((sum, u) => sum + u.commits, 0);
    return {
      topUsers: users.slice(0, 3),
      totalUsers: users.length,
      totalCommits: commits,
      avgCommits: users.length ? Math.round(commits / users.length) : 0,
    };
  }, [currentData]);

  const isEmpty = !isLoading && !isError && inView && topUsers.length === 0;

  return (
    <article
      ref={ref}
      aria-busy={isLoading}
      className="group surface relative flex h-full flex-col rounded-xl p-5 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] hover:shadow-[5px_5px_0_var(--ink)] motion-safe:hover:-translate-x-px motion-safe:hover:-translate-y-px motion-reduce:transition-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {isLoading ? (
            <div className="skeleton h-8 w-11 shrink-0" />
          ) : (
            <Flag src={country.flagUrl} />
          )}
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-display text-xl font-extrabold uppercase leading-[0.95] tracking-[-0.01em]">
              {/* Stretched link: the ::after covers the whole card */}
              <Link
                to={`/${country.slug}`}
                className="text-foreground after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-[3px] focus-visible:after:outline-offset-[3px] focus-visible:after:outline-[color:var(--focus)]"
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
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-card text-foreground transition-colors group-hover:bg-brand motion-reduce:transition-none"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Stats */}
      <dl className="mt-5 grid grid-cols-2 divide-x-2 divide-dashed divide-foreground/25 border-y-2 border-dashed border-foreground/25 py-3">
        <div className="pr-3">
          <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Developers
          </dt>
          <dd className="mt-1 font-display text-2xl leading-none text-foreground">
            <StatValue loading={isLoading} error={isError}>
              {totalUsers.toLocaleString()}
            </StatValue>
          </dd>
        </div>
        <div className="pl-4">
          <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Public commits
          </dt>
          <dd className="mt-1 font-display text-2xl leading-none text-foreground">
            <StatValue loading={isLoading} error={isError}>
              {formatCompactNumber(totalCommits)}
            </StatValue>
          </dd>
        </div>
      </dl>

      {/* Top performers */}
      <div className="mt-4 flex-1">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="eyebrow">Top performers</p>
          {!isLoading && !isError && totalUsers > 0 && (
            <span className="font-mono text-xs text-muted-foreground">
              {formatCompactNumber(avgCommits)} avg/dev
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
                  <div className="skeleton h-6 w-7" />
                  <div className="skeleton h-7 w-7 rounded-full" />
                  <div className="skeleton h-3.5 flex-1" />
                  <div className="skeleton h-3.5 w-10" />
                </li>
              ))
            : topUsers.map((user, index) => (
                <li key={user.username}>
                  {/* relative z-10 lifts the button above the stretched link */}
                  <button
                    type="button"
                    onClick={() => onUserClick(user)}
                    aria-label={`View ${user.username}'s contributor profile`}
                    className="relative z-10 flex min-h-11 w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    <span
                      className={`flex h-6 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium ${
                        index === 0
                          ? "border-2 border-foreground bg-brand text-brand-foreground"
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
                  </button>
                </li>
              ))}
        </ul>

        {isError && (
          <div className="flex items-center justify-between gap-3 rounded-lg border-2 border-dashed border-foreground/40 px-3 py-3 text-sm text-foreground/80">
            <span>Couldn’t load rankings.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="relative z-10 inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border-2 border-foreground bg-card px-2.5 py-1 font-mono text-xs uppercase tracking-[0.08em] text-foreground shadow-[2px_2px_0_var(--ink)] transition-[transform,box-shadow] active:translate-x-px active:translate-y-px active:shadow-none motion-reduce:transition-none"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-foreground/40 px-3 py-3 text-sm text-foreground/80">
            <GitCommit className="h-4 w-4 shrink-0" aria-hidden="true" />
            No public commit data for this country yet.
          </div>
        )}
      </div>
    </article>
  );
};
