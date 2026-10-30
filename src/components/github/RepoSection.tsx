import { useId, useMemo, useState } from "react";
import { ArrowUpRight, FolderGit2, Search, X } from "lucide-react";
import type { GitHubRepo } from "@/types";
import type { RepoSort } from "@/api/githubApi";
import { formatCompactNumber } from "@/lib/format";
import { sortRepos } from "@/lib/github";
import { SectionHeading } from "@/components/common/PageHeader";
import { Card, CardMessage } from "@/components/common/Card";
import { RepoCard, RepoCardSkeleton } from "./RepoCard";

const SORTS: { value: RepoSort; label: string }[] = [
  { value: "pushed", label: "Recent work" },
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Newest" },
  { value: "full_name", label: "A–Z" },
];

export const RepoSection = ({
  repos,
  totalRepos,
  handle,
  sort,
  onSortChange,
  showAll,
  onToggleShowAll,
  limit,
  isLoading,
  isError,
  onRetry,
}: {
  repos: GitHubRepo[];
  /** `public_repos` from the profile, for the "all" affordance. */
  totalRepos?: number;
  handle: string;
  sort: RepoSort;
  onSortChange: (sort: RepoSort) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
  limit: number;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}) => {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [includeForks, setIncludeForks] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return repos.filter((repo) => {
      if (!includeForks && repo.fork) return false;
      if (!needle) return true;
      return (
        repo.name.toLowerCase().includes(needle) ||
        (repo.description ?? "").toLowerCase().includes(needle) ||
        (repo.language ?? "").toLowerCase().includes(needle) ||
        (repo.topics ?? []).some((topic) =>
          topic.toLowerCase().includes(needle),
        )
      );
    });
  }, [repos, query, includeForks]);

  const visible = useMemo(() => {
    const sorted = sortRepos(filtered, sort);
    return showAll ? sorted : sorted.slice(0, limit);
  }, [filtered, sort, showAll, limit]);

  const forkCount = repos.filter((repo) => repo.fork).length;
  const hasMore = filtered.length > visible.length;
  const canShowMore = totalRepos ? filtered.length < totalRepos : true;
  const hasControls = Boolean(query) || includeForks;

  return (
    <section aria-labelledby="repos-heading" className="space-y-4">
      <SectionHeading
        id="repos-heading"
        eyebrow="Code"
        title="Repositories"
        description={
          isLoading
            ? "Loading public repositories from GitHub."
            : `${filtered.length} ${filtered.length === 1 ? "repository" : "repositories"}${
                totalRepos && totalRepos > repos.length
                  ? ` · ${formatCompactNumber(totalRepos)} public in total`
                  : ""
              }`
        }
        action={
          <a
            href={`https://github.com/${handle}?tab=repositories&sort=pushed`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline"
          >
            All on GitHub
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        }
      />

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Filter repositories by name, description or language
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter repositories"
            autoComplete="off"
            className="h-10 w-full border border-border bg-card pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear repository filter"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div
          className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1"
          role="group"
          aria-label="Sort repositories"
        >
          {SORTS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSortChange(option.value)}
              aria-pressed={sort === option.value}
              className="chip shrink-0 whitespace-nowrap py-1.5"
            >
              {option.label}
            </button>
          ))}

          {forkCount > 0 ? (
            <button
              type="button"
              onClick={() => setIncludeForks((value) => !value)}
              aria-pressed={includeForks}
              className="chip shrink-0 whitespace-nowrap py-1.5"
            >
              Forks · {forkCount}
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <RepoCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardMessage
            tone="danger"
            icon={<FolderGit2 />}
            title="Couldn’t load repositories"
            description="GitHub didn’t return this account’s repositories. The rest of the profile is unaffected."
            action={
              onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="button-secondary"
                >
                  Try again
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <CardMessage
            icon={<FolderGit2 />}
            title={
              query ? "No matching repositories" : "No public repositories"
            }
            description={
              query
                ? `Nothing in this account matches “${query}”. Try a language, a topic or a shorter term.`
                : "GitHub reports no public repositories for this account."
            }
            action={
              query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="button-secondary"
                >
                  Clear filter
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {visible.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>

          {hasMore && canShowMore ? (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={onToggleShowAll}
                className="button-secondary"
                aria-expanded={showAll}
              >
                {showAll
                  ? "Show fewer"
                  : hasControls
                    ? `Show all ${filtered.length} matches`
                    : `Show all ${filtered.length} loaded`}
              </button>
            </div>
          ) : null}

          {showAll && totalRepos && repos.length < totalRepos ? (
            <p className="text-center text-xs text-muted-foreground">
              Showing the {repos.length} most recent of{" "}
              {formatCompactNumber(totalRepos)} public repositories — see GitHub
              for the rest.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
};
