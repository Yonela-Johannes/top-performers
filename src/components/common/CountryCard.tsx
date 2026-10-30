import { Link } from "react-router-dom";
import { useGetCountryUsersQuery } from "@/api";
import type { Committer } from "@/types";
import { ArrowUpRight, GitCommit } from "lucide-react";
import { formatCompactNumber } from "@/lib/format";

interface CountryCardProps {
  country: { slug: string; name: string; flagUrl?: string };
  region?: string;
  onUserClick: (user: Committer) => void;
}

export const CountryCard = ({ country, region, onUserClick }: CountryCardProps) => {
  const { data, isLoading } = useGetCountryUsersQuery({
    country: country.slug,
    mode: "all",
  });

  const topUsers = data?.users?.slice(0, 3) || [];
  const totalUsers = data?.users?.length || 0;
  const totalCommits =
    data?.users?.reduce((sum, user) => sum + user.commits, 0) || 0;
  const avgCommits = totalUsers ? Math.round(totalCommits / totalUsers) : 0;

  return (
    <article className="group surface flex h-full flex-col p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] motion-reduce:transform-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {isLoading ? (
            <div className="skeleton h-8 w-11 shrink-0" />
          ) : country.flagUrl ? (
            <img
              src={country.flagUrl}
              alt=""
              className="h-8 w-11 shrink-0 rounded-md border border-border/70 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted font-mono text-[10px] text-muted-foreground">
              {country.slug.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-semibold leading-tight">
              <Link
                to={`/${country.slug}`}
                className="rounded-sm text-foreground transition-colors hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                {country.name}
              </Link>
            </h3>
            <p className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {region || "Global"}
            </p>
          </div>
        </div>
        <Link
          to={`/${country.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 divide-x divide-border border-y border-border py-3">
        <div className="pr-3">
          <p className="stat-value text-lg font-medium text-foreground">
            {isLoading ? "—" : totalUsers.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Developers
          </p>
        </div>
        <div className="pl-4">
          <p className="stat-value text-lg font-medium text-foreground">
            {isLoading ? "—" : formatCompactNumber(totalCommits)}
          </p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Public commits
          </p>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <p className="eyebrow text-[10px]">Top performers</p>
          {!isLoading && totalUsers > 0 && (
            <span
              className="font-mono text-[10px] text-muted-foreground"
              title="Average public commits per developer"
            >
              {formatCompactNumber(avgCommits)} avg
            </span>
          )}
        </div>

        <ul className="space-y-0.5">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-3 py-1.5">
                  <div className="skeleton h-7 w-7 rounded-full" />
                  <div className="skeleton h-3.5 flex-1" />
                  <div className="skeleton h-3 w-10" />
                </li>
              ))
            : topUsers.map((user, index) => (
                <li key={user.username}>
                  <button
                    type="button"
                    onClick={() => onUserClick(user)}
                    className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View ${user.username}'s contributor profile`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-medium ${
                        index === 0
                          ? "border-2 border-foreground bg-brand text-brand-foreground"
                          : "border border-border bg-secondary text-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <img
                      src={user.avatar}
                      alt=""
                      className="h-7 w-7 shrink-0 rounded-full border border-border"
                      loading="lazy"
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                      {user.username}
                    </span>
                    <span className="stat-value shrink-0 text-xs text-muted-foreground">
                      {formatCompactNumber(user.commits)}
                    </span>
                  </button>
                </li>
              ))}
        </ul>

        {!isLoading && topUsers.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            <GitCommit className="h-3.5 w-3.5" aria-hidden="true" />
            No ranking data yet
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <Link
          to={`/${country.slug}`}
          className="inline-flex items-center gap-1.5 rounded-sm font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          View leaderboard
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
};
