import { useMemo } from "react";
import {
  Archive,
  ArrowUpRight,
  Eye,
  GitFork,
  Scale,
  Star,
  CircleDot,
} from "lucide-react";
import { useGetRepoLanguagesQuery } from "@/api/githubApi";
import type { GitHubRepo } from "@/types";
import { formatCompactNumber } from "@/lib/format";
import { languageColor, relativeTime, toLanguageStats } from "@/lib/github";
import { Card, SkeletonBlock } from "@/components/common/Card";

interface RepoCardProps {
  repo: GitHubRepo;
  showLanguageBar?: boolean;
  featured?: boolean;
}

const normalizeHomepage = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

const formatDate = (value?: string | null) => {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const RepoCard = ({
  repo,
  showLanguageBar = false,
  featured = false,
}: RepoCardProps) => {
  const [owner, name] = repo.full_name.split("/");
  const { data: languages, isLoading: languagesLoading } =
    useGetRepoLanguagesQuery({ owner, repo: name }, { skip: !showLanguageBar });

  const languageStats = useMemo(
    () => toLanguageStats(languages, 4),
    [languages],
  );

  const topics = (repo.topics ?? []).slice(0, featured ? 4 : 3);
  const description = repo.description?.trim();

  return (
    <Card interactive className="group relative h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-1.5 text-[15px] font-semibold leading-snug text-foreground after:absolute after:inset-0 after:rounded-xl after:ring-inset focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus)]"
          >
            <span className="truncate">{repo.name}</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </a>
          {repo.homepage ? (
            <a
              href={normalizeHomepage(repo.homepage)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-[11px] text-brand-ink hover:underline"
            >
              {repo.homepage.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          ) : (
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              {repo.full_name}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {repo.archived ? (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--warning)/0.35)] bg-[hsl(var(--warning-soft))] px-2 py-0.5 font-mono text-[10px] font-medium text-[hsl(var(--warning))]"
              title="Archived repository"
            >
              <Archive className="h-3 w-3" aria-hidden="true" />
              Archived
            </span>
          ) : null}
          {repo.fork ? (
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              Fork
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-3 line-clamp-2 min-h-[2.6em] text-sm leading-6 text-muted-foreground">
        {description || "No description provided."}
      </p>

      {topics.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Topics">
          {topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full border border-border bg-[var(--surface-muted)] px-2 py-0.5 font-mono text-[10px] font-medium text-ink-secondary"
            >
              {topic}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto pt-4">
        {showLanguageBar ? (
          <div className="mb-3" aria-hidden={languageStats.length === 0}>
            {languagesLoading && !languageStats.length ? (
              <SkeletonBlock className="h-1.5 w-full rounded-full" />
            ) : languageStats.length > 0 ? (
              <>
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  {languageStats.map((language) => (
                    <span
                      key={language.name}
                      style={{
                        width: `${Math.max(language.percent, 2)}%`,
                        backgroundColor: languageColor(language.name),
                      }}
                      title={`${language.name} · ${language.percent.toFixed(1)}%`}
                    />
                  ))}
                </div>
                <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
                  {languageStats
                    .map(
                      (language) =>
                        `${language.name} ${language.percent.toFixed(0)}%`,
                    )
                    .join(" · ")}
                </p>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
          {repo.language ? (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: languageColor(repo.language) }}
              />
              {repo.language}
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1" title="Stars">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="stat-value">
              {formatCompactNumber(repo.stargazers_count)}
            </span>
            <span className="sr-only">stars</span>
          </span>

          <span className="inline-flex items-center gap-1" title="Forks">
            <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="stat-value">
              {formatCompactNumber(repo.forks_count)}
            </span>
            <span className="sr-only">forks</span>
          </span>

          {repo.watchers_count > 0 ? (
            <span className="inline-flex items-center gap-1" title="Watchers">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="stat-value">
                {formatCompactNumber(repo.watchers_count)}
              </span>
              <span className="sr-only">watchers</span>
            </span>
          ) : null}

          {repo.open_issues_count > 0 ? (
            <span
              className="inline-flex items-center gap-1"
              title="Open issues and pull requests"
            >
              <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="stat-value">
                {formatCompactNumber(repo.open_issues_count)}
              </span>
              <span className="sr-only">open issues</span>
            </span>
          ) : null}

          {repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? (
            <span
              className="hidden items-center gap-1 sm:inline-flex"
              title={repo.license.name}
            >
              <Scale className="h-3.5 w-3.5" aria-hidden="true" />
              {repo.license.spdx_id}
            </span>
          ) : null}

          <span
            className="ml-auto whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.06em] max-sm:basis-full max-sm:text-left"
            title={`Last push: ${formatDate(repo.pushed_at)}`}
          >
            {repo.pushed_at
              ? `pushed ${relativeTime(repo.pushed_at)}`
              : `updated ${relativeTime(repo.updated_at)}`}
          </span>
        </div>
      </div>
    </Card>
  );
};

/** Loading placeholder that matches the final card height. */
export const RepoCardSkeleton = () => (
  <div className="panel h-full p-5">
    <SkeletonBlock className="h-4 w-2/3" />
    <SkeletonBlock className="mt-2 h-2.5 w-1/3" />
    <SkeletonBlock className="mt-4 h-3 w-full" />
    <SkeletonBlock className="mt-2 h-3 w-5/6" />
    <div className="mt-6 flex gap-3 border-t border-border pt-3">
      <SkeletonBlock className="h-3 w-14" />
      <SkeletonBlock className="h-3 w-10" />
      <SkeletonBlock className="h-3 w-10" />
    </div>
  </div>
);
