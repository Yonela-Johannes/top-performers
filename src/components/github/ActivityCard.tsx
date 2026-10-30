import { useMemo } from "react";
import {
  ArrowUpRight,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Package,
  Star,
  Tags,
  CircleDot,
  FolderPlus,
} from "lucide-react";
import type { GitHubEvent } from "@/types";
import {
  commitSeries,
  relativeTime,
  toActivityItems,
  type ActivityItem,
} from "@/lib/github";
import {
  Card,
  CardHeader,
  CardMessage,
  SkeletonBlock,
} from "@/components/common/Card";

const KIND_META: Record<
  ActivityItem["kind"],
  { icon: typeof GitCommitHorizontal; label: string }
> = {
  commit: { icon: GitCommitHorizontal, label: "Commit" },
  repository: { icon: FolderPlus, label: "Repository" },
  "pull request": { icon: GitPullRequest, label: "Pull request" },
  "code review": { icon: GitPullRequest, label: "Code review" },
  issue: { icon: CircleDot, label: "Issue" },
  release: { icon: Package, label: "Release" },
  star: { icon: Star, label: "Star" },
  fork: { icon: GitFork, label: "Fork" },
  branch: { icon: GitBranch, label: "Branch" },
  tag: { icon: Tags, label: "Tag" },
};

interface ActivityCardProps {
  events?: GitHubEvent[];
  isLoading: boolean;
  isError: boolean;
  limit?: number;
  /** Days actually covered by the event window; defaults to the chart width. */
  coverageDays?: number;
}

export const ActivityCard = ({
  events,
  isLoading,
  isError,
  limit = 8,
  coverageDays = 30,
}: ActivityCardProps) => {
  // One window for both the chart and the list, so they can never disagree.
  const window = Math.max(7, Math.min(90, coverageDays || 30));
  const items = useMemo(
    () => toActivityItems(events).slice(0, limit),
    [events, limit],
  );
  const series = useMemo(() => commitSeries(events, window), [events, window]);

  const maxCommits = Math.max(1, ...series.map((day) => day.count));
  const totalCommits = series.reduce((sum, day) => sum + day.count, 0);
  const activeDays = series.filter((day) => day.count > 0).length;

  return (
    <Card>
      <CardHeader
        eyebrow="Activity"
        title="Recent work"
        description="Public events from GitHub, newest first."
        icon={<GitCommitHorizontal />}
        action={
          !isLoading && totalCommits > 0 ? (
            <div className="text-right">
              <p className="stat-value text-xl font-semibold leading-none text-foreground">
                {totalCommits.toLocaleString()}
              </p>
              <p className="card-label mt-1">
                commits · {window}d
              </p>
            </div>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="mt-5 space-y-4" aria-busy="true">
          <SkeletonBlock className="h-12 w-full" />
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-3 w-3/4" />
                <SkeletonBlock className="h-2.5 w-1/3" />
              </div>
            </div>
          ))}
          <p className="sr-only">Loading recent activity</p>
        </div>
      ) : isError ? (
        <CardMessage
          className="mt-5"
          tone="danger"
          icon={<GitCommitHorizontal />}
          title="Couldn’t load activity"
          description="GitHub didn’t return events for this account just now. The rest of the profile is unaffected."
        />
      ) : items.length === 0 ? (
        <CardMessage
          className="mt-5"
          icon={<GitCommitHorizontal />}
          title="No public activity yet"
          description="Pushes to private repositories never appear here."
        />
      ) : (
        <>
          {/* 30-day commit sparkline — real PushEvent payloads */}
          <div className="mt-5">
            <div
              className="flex h-12 items-end gap-[3px]"
              role="img"
              aria-label={`${totalCommits} commits across ${activeDays} active days in the last ${window} days`}
            >
              {series.map((day) => (
                <span
                  key={day.date}
                  title={`${day.date}: ${day.count} commit${day.count === 1 ? "" : "s"}`}
                  className={`min-h-[2px] flex-1 rounded-sm transition-colors ${
                    day.count > 0 ? "bg-brand/80" : "bg-secondary"
                  }`}
                  style={{
                    height: `${Math.max(4, (day.count / maxCommits) * 100)}%`,
                  }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              <span>{window} days ago</span>
              <span>{activeDays} active days</span>
              <span>today</span>
            </div>
          </div>

          <ul className="mt-5 divide-y divide-border">
            {items.map((item) => {
              const Icon = KIND_META[item.kind].icon;
              return (
                <li key={item.id}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 py-3 transition-colors hover:bg-secondary/40"
                  >
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors group-hover:text-foreground">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span className="truncate font-mono">{item.repo}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">
                          {KIND_META[item.kind].label}
                        </span>
                        {item.commitCount && item.commitCount > 1 ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.commitCount} commits</span>
                          </>
                        ) : null}
                        <span aria-hidden="true">·</span>
                        <time dateTime={item.createdAt}>
                          {relativeTime(item.createdAt)}
                        </time>
                      </span>
                    </span>
                    <ArrowUpRight
                      className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
};
