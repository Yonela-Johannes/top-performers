import type {
  GitHubEvent,
  GitHubLanguageMap,
  GitHubRepo,
  GitHubUser,
  LanguageStat,
} from "@/types";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  Perl: "#0298c3",
  R: "#198CE7",
  Scala: "#c22d40",
  Zig: "#ec915c",
  Clojure: "#db5855",
  "Jupyter Notebook": "#DA5B0B",
  Dockerfile: "#384d54",
  MDX: "#fcb32c",
  Astro: "#ff5a03",
  Nix: "#7e7eff",
  Jinja: "#a52a22",
  Objective_C: "#438eff",
};

const FALLBACK_COLORS = [
  "#6f6ae1",
  "#e1665c",
  "#2fa27a",
  "#c08a2b",
  "#3d8fb5",
  "#a055b8",
];

export const languageColor = (language?: string | null): string => {
  if (!language) return "#8b8794";
  if (LANGUAGE_COLORS[language]) return LANGUAGE_COLORS[language];
  let hash = 0;
  for (let i = 0; i < language.length; i += 1) {
    hash = (hash * 31 + language.charCodeAt(i)) % 9973;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};

/** Turn `{TypeScript: 1200, CSS: 300}` into sorted, percentage-bearing rows. */
export const toLanguageStats = (
  map: GitHubLanguageMap | undefined,
  limit = 5,
): LanguageStat[] => {
  if (!map) return [];
  const entries = Object.entries(map).filter(([, bytes]) => bytes > 0);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (!total) return [];
  return entries
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: (bytes / total) * 100,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit);
};

/**
 * Primary language across a set of repositories, weighted by how recently each
 * repository was pushed. A repository touched last week counts for more than
 * one abandoned two years ago, which matches what "works mostly in X" means in
 * practice.
 */
export const dominantLanguage = (
  repos: GitHubRepo[],
): { name: string; count: number; share: number } | null => {
  if (!repos.length) return null;
  const weights = new Map<string, number>();
  const counts = new Map<string, number>();
  const now = Date.now();

  repos.forEach((repo) => {
    if (!repo.language) return;
    const pushed = repo.pushed_at ? new Date(repo.pushed_at).getTime() : 0;
    const ageDays = pushed ? Math.max(0, (now - pushed) / 86_400_000) : 3650;
    const weight = 1 / (1 + ageDays / 180);
    weights.set(repo.language, (weights.get(repo.language) ?? 0) + weight);
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  });

  const totalWeight = [...weights.values()].reduce(
    (sum, value) => sum + value,
    0,
  );
  if (!totalWeight) return null;

  const [name] = [...weights.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    name,
    count: counts.get(name) ?? 0,
    share: ((weights.get(name) ?? 0) / totalWeight) * 100,
  };
};

export const sortRepos = (
  repos: GitHubRepo[],
  sort: "pushed" | "updated" | "created" | "full_name",
): GitHubRepo[] => {
  const copy = [...repos];
  switch (sort) {
    case "full_name":
      return copy.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
    case "created":
      return copy.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case "updated":
      return copy.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    case "pushed":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.pushed_at ?? b.updated_at).getTime() -
          new Date(a.pushed_at ?? a.updated_at).getTime(),
      );
  }
};

export const countrySlugToTerm = (slug?: string | null) => {
  if (!slug) return null;
  const term = slug.replace(/-/g, " ").trim();
  return term.length >= 3 ? term : null;
};

/** Total stars and forks across the loaded repositories. */
export const repoTotals = (repos: GitHubRepo[]) =>
  repos.reduce(
    (totals, repo) => ({
      stars: totals.stars + repo.stargazers_count,
      forks: totals.forks + repo.forks_count,
      issues: totals.issues + repo.open_issues_count,
    }),
    { stars: 0, forks: 0, issues: 0 },
  );



export const githubProfileUrl = (user: Pick<GitHubUser, "login"> | string) =>
  `https://github.com/${typeof user === "string" ? user : user.login}`;



export const normalizeExternalUrl = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const accountAge = (createdAt?: string) => {
  if (!createdAt) return null;
  const joined = new Date(createdAt);
  if (Number.isNaN(joined.getTime())) return null;
  const years = (Date.now() - joined.getTime()) / (365.25 * 86_400_000);
  return {
    joined,
    years: Math.max(0, Math.floor(years)),
  };
};

/** "3h ago" / "5d ago" / "12 Mar 2025" — compact and unambiguous. */
export const relativeTime = (value?: string | null) => {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const branchFromRef = (ref?: string) =>
  ref ? ref.replace(/^refs\/heads\//, "") : "";

export interface ActivityItem {
  id: string;
  kind:
    | "commit"
    | "repository"
    | "pull request"
    | "code review"
    | "issue"
    | "release"
    | "star"
    | "fork"
    | "branch"
    | "tag";
  title: string;
  detail: string;
  repo: string;
  url: string;
  createdAt: string;
  commitCount?: number;
}

export const toActivityItems = (
  events: GitHubEvent[] | undefined,
): ActivityItem[] => {
  if (!events?.length) return [];
  const items: ActivityItem[] = [];

  for (const event of events) {
    const repo = event.repo?.name ?? "";
    const repoUrl = `https://github.com/${repo}`;
    const base = { id: event.id, repo, createdAt: event.created_at };

    switch (event.type) {
      case "PushEvent": {
        const payload = (event as import("@/types").GitHubPushEvent).payload;
        const commits = payload.commits ?? [];
        items.push({
          ...base,
          kind: "commit",
          title:
            commits[0]?.message?.split("\n")[0] ||
            `Pushed to ${branchFromRef(payload.ref)}`,
          detail: branchFromRef(payload.ref)
            ? `pushed to ${branchFromRef(payload.ref)}`
            : "pushed commits",
          url: commits[0]?.sha
            ? `${repoUrl}/commit/${commits[0].sha}`
            : repoUrl,
          commitCount: payload.size ?? commits.length,
        });
        break;
      }
      case "CreateEvent": {
        const payload = (event as import("@/types").GitHubCreateEvent).payload;
        if (payload.ref_type === "repository") {
          items.push({
            ...base,
            kind: "repository",
            title: "Created " + repo,
            detail: payload.description || "new repository",
            url: repoUrl,
          });
        } else {
          items.push({
            ...base,
            kind: payload.ref_type === "tag" ? "tag" : "branch",
            title: `Created ${payload.ref_type} ${payload.ref ?? ""}`.trim(),
            detail: repo,
            url: repoUrl,
          });
        }
        break;
      }
      case "PullRequestEvent": {
        const payload = (event as import("@/types").GitHubPullRequestEvent)
          .payload;
        items.push({
          ...base,
          kind: "pull request",
          title: payload.pull_request.title,
          detail: `${payload.action} #${payload.number}`,
          url: payload.pull_request.html_url,
        });
        break;
      }
      case "PullRequestReviewCommentEvent": {
        const payload = (
          event as import("@/types").GitHubPullRequestReviewCommentEvent
        ).payload;
        items.push({
          ...base,
          kind: "code review",
          title: payload.pull_request.title,
          detail: `reviewed #${payload.pull_request.number}`,
          url: payload.comment?.html_url || payload.pull_request.html_url,
        });
        break;
      }
      case "IssuesEvent": {
        const payload = (event as import("@/types").GitHubIssuesEvent).payload;
        items.push({
          ...base,
          kind: "issue",
          title: payload.issue.title,
          detail: `${payload.action} #${payload.issue.number}`,
          url: payload.issue.html_url,
        });
        break;
      }
      case "ReleaseEvent": {
        const payload = (event as import("@/types").GitHubReleaseEvent).payload;
        items.push({
          ...base,
          kind: "release",
          title: payload.release.name || payload.release.tag_name,
          detail: payload.action,
          url: payload.release.html_url,
        });
        break;
      }
      case "WatchEvent":
        items.push({
          ...base,
          kind: "star",
          title: `Starred ${repo}`,
          detail: "interested in this project",
          url: repoUrl,
        });
        break;
      case "ForkEvent": {
        const payload = (event as import("@/types").GitHubForkEvent).payload;
        items.push({
          ...base,
          kind: "fork",
          title: `Forked ${repo}`,
          detail: payload.forkee?.full_name ?? "",
          url: payload.forkee?.html_url ?? repoUrl,
        });
        break;
      }
      default:
        break;
    }
  }

  return items;
};

export const eventCoverageDays = (events: GitHubEvent[] | undefined) => {
  if (!events?.length) return 0;
  const oldest = events.reduce((min, event) => {
    const time = new Date(event.created_at).getTime();
    return time < min ? time : min;
  }, Date.now());
  return Math.min(90, Math.max(1, Math.ceil((Date.now() - oldest) / 86_400_000)));
};

/** Commit totals per day for the last `days` days, from PushEvents. */
export const commitSeries = (events: GitHubEvent[] | undefined, days = 30) => {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    buckets.set(day.toISOString().slice(0, 10), 0);
  }

  (events ?? []).forEach((event) => {
    if (event.type !== "PushEvent") return;
    const key = new Date(event.created_at).toISOString().slice(0, 10);
    if (!buckets.has(key)) return;
    const payload = (event as import("@/types").GitHubPushEvent).payload;
    buckets.set(
      key,
      (buckets.get(key) ?? 0) + (payload.size ?? payload.commits?.length ?? 0),
    );
  });

  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
};

export const activeStreak = (series: { date: string; count: number }[]) => {
  let streak = 0;
  for (let i = series.length - 1; i >= 0; i -= 1) {
    if (series[i].count > 0) {
      streak += 1;
    } else if (i === series.length - 1) {
      continue;
    } else {
      break;
    }
  }
  return streak;
};
