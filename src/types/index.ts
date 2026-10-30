export interface Committer {
  rank: number;
  username: string;
  realname?: string;
  profile: string;
  commits: number;
  avatar: string;
  rankMessage?: string;
}
export type Mode = "commits" | "contributions" | "all";

/** The subset of `GET /users/:login` the interface reads. */
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  twitter_username?: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists?: number;
  created_at: string;
  html_url: string;
}

/** The subset of `GET /users/:login/repos` the repository card reads. */
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch?: string;
  fork: boolean;
  archived?: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  topics?: string[];
  license?: { key: string; name: string; spdx_id: string | null } | null;
  homepage?: string | null;
  size: number;
  updated_at: string;
  pushed_at: string | null;
  created_at: string;
}

interface GitHubEventBase {
  id: string;
  type: string;
  created_at: string;
  repo: { id: number; name: string; url: string };
}

export interface GitHubPushEvent extends GitHubEventBase {
  type: "PushEvent";
  payload: {
    ref: string;
    head: string;
    before: string;
    size?: number;
    distinct_size?: number;
    commits?: { sha: string; message: string; author?: { name?: string } }[];
  };
}

export interface GitHubCreateEvent extends GitHubEventBase {
  type: "CreateEvent";
  payload: {
    ref: string | null;
    ref_type: "branch" | "tag" | "repository";
    master_branch?: string;
    description?: string | null;
  };
}

export interface GitHubPullRequestEvent extends GitHubEventBase {
  type: "PullRequestEvent";
  payload: {
    action: string;
    number: number;
    pull_request: {
      title: string;
      html_url: string;
      merged?: boolean;
      additions?: number;
      deletions?: number;
      draft?: boolean;
    };
  };
}

export interface GitHubIssuesEvent extends GitHubEventBase {
  type: "IssuesEvent";
  payload: {
    action: string;
    issue: { title: string; html_url: string; number: number };
  };
}

export interface GitHubReleaseEvent extends GitHubEventBase {
  type: "ReleaseEvent";
  payload: {
    action: string;
    release: { name: string | null; tag_name: string; html_url: string };
  };
}

export interface GitHubWatchEvent extends GitHubEventBase {
  type: "WatchEvent";
  payload: { action: string };
}

export interface GitHubForkEvent extends GitHubEventBase {
  type: "ForkEvent";
  payload: { forkee: { full_name: string; html_url: string } };
}

export interface GitHubPullRequestReviewCommentEvent extends GitHubEventBase {
  type: "PullRequestReviewCommentEvent";
  payload: {
    action: string;
    comment: { html_url: string; body?: string };
    pull_request: { title: string; html_url: string; number: number };
  };
}

/** `GET /users/:login/followers` — one row. */
export interface GitHubFollower {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

/** `GET /gists/public` filtered to a user, or `GET /users/:login/gists`. */
export interface GitHubGist {
  id: string;
  html_url: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  comments: number;
  files: Record<string, { filename?: string; language?: string | null }>;
}

/** `GET /rate_limit` — unauthenticated quota, used for honest UI states. */
export interface GitHubRateLimit {
  resources: {
    core: { limit: number; remaining: number; reset: number };
  };
}

export interface GitHubGenericEvent extends GitHubEventBase {
  payload: Record<string, unknown>;
}

/** Any public event; narrow with `event.type` before reading the payload. */
export type GitHubEvent =
  | GitHubPushEvent
  | GitHubCreateEvent
  | GitHubPullRequestEvent
  | GitHubIssuesEvent
  | GitHubReleaseEvent
  | GitHubWatchEvent
  | GitHubForkEvent
  | GitHubPullRequestReviewCommentEvent
  | GitHubGenericEvent;

/** `GET /repos/:owner/:repo/languages` — language → bytes. */
export type GitHubLanguageMap = Record<string, number>;

export interface LanguageStat {
  name: string;
  bytes: number;
  percent: number;
}

export type SortOption =
  | "alphabetical-asc"
  | "alphabetical-desc"
  | "commits-desc"
  | "commits-asc";
