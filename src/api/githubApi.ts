import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  GitHubEvent,
  GitHubFollower,
  GitHubGist,
  GitHubLanguageMap,
  GitHubRateLimit,
  GitHubRepo,
  GitHubUser,
} from "@/types";
import { GITHUB_API_BASE_URL } from "./config";

/**
 * GitHub REST data.
 *
 * Expanded from "fetch a profile" to the set of reads a developer page
 * actually needs: the profile, their recently pushed repositories, their
 * public events (the only real activity feed the REST API exposes
 * unauthenticated) and a language-file inventory for repository-level
 * language chips. Everything is public, read-only data — no OAuth, no token
 * storage, nothing beyond the optional `VITE_GITHUB_TOKEN` the project already
 * documented for higher rate limits.
 *
 * Responses are cached by RTK Query per username for ten minutes, so opening
 * the same developer twice (dialog, then page) costs one request.
 */

const CACHE_SECONDS = 600;
const DEFAULT_REPO_LIMIT = 8;

const githubBaseQuery = fetchBaseQuery({
  baseUrl: GITHUB_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Accept", "application/vnd.github+json");
    return headers;
  },
});

/**
 * A GitHub 403/429 is almost always the unauthenticated rate limit, which the
 * UI surfaces differently from "this profile does not exist". Turning it into a
 * typed error lets callers say so instead of guessing.
 */
type GithubErrorPayload = {
  status?: number;
  data?: { message?: string };
};

export type GithubFailureKind =
  | "not-found"
  | "rate-limited"
  | "network"
  | "unknown";

export const classifyGithubError = (error: unknown): GithubFailureKind => {
  const payload = error as GithubErrorPayload | undefined;
  const status = payload?.status;
  if (status === 404) return "not-found";
  if (status === 403 || status === 429) return "rate-limited";
  return payload?.status === undefined ? "network" : "unknown";
};

/** Sort keys accepted by `GET /users/:login/repos`. */
export type RepoSort = "pushed" | "updated" | "created" | "full_name";

export interface RepoQueryArgs {
  username: string;
  /** How many repositories to return. */
  perPage?: number;
  /** `pushed` = recent commits, `updated` = recent metadata, `full_name` = A–Z. */
  sort?: RepoSort;
  direction?: "asc" | "desc";
  page?: number;
}

/**
 * The repository list endpoint paginates, but a profile only samples it. The
 * "all" scope is the largest the page will request in one go (GitHub caps
 * `per_page` at 100).
 */
export const MAX_REPOS_PER_PAGE = 100;

export const githubApi = createApi({
  reducerPath: "githubApi",
  baseQuery: githubBaseQuery,
  keepUnusedDataFor: CACHE_SECONDS,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    getGitHubUserByUsername: builder.query<GitHubUser, string>({
      query: (username) => `users/${encodeURIComponent(username)}`,
    }),

    /** Public, non-fork repositories ordered by recency of work. */
    getGitHubRepos: builder.query<GitHubRepo[], RepoQueryArgs>({
      query: ({
        username,
        perPage = DEFAULT_REPO_LIMIT,
        sort = "pushed",
        direction = "desc",
        page = 1,
      }) =>
        `users/${encodeURIComponent(username)}/repos?per_page=${perPage}&sort=${sort}&direction=${direction}&page=${page}&type=owner`,
    }),

    /** Recent public activity (push, create, PR, issue, release, star…). */
    getGitHubEvents: builder.query<
      GitHubEvent[],
      { username: string; perPage?: number }
    >({
      query: ({ username, perPage = 30 }) =>
        `users/${encodeURIComponent(username)}/events/public?per_page=${perPage}`,
    }),

    /** Language file inventory for one repository. */
    getRepoLanguages: builder.query<
      GitHubLanguageMap,
      { owner: string; repo: string }
    >({
      query: ({ owner, repo }) =>
        `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
    }),

    /**
     * Recent followers. The reference project rendered these as a "contributor
     * network" strip; a small, visual sample of the people around an account
     * says more about them than the follower count alone.
     */
    getGitHubFollowers: builder.query<
      GitHubFollower[],
      { username: string; perPage?: number }
    >({
      query: ({ username, perPage = 12 }) =>
        `users/${encodeURIComponent(username)}/followers?per_page=${perPage}`,
    }),

    /**
     * Public gists. A profile section of its own: gists are the snippets and
     * notes a developer keeps, and they are not visible from repositories.
     */
    getGitHubGists: builder.query<
      GitHubGist[],
      { username: string; perPage?: number }
    >({
      query: ({ username, perPage = 6 }) =>
        `users/${encodeURIComponent(username)}/gists?per_page=${perPage}`,
    }),

    /**
     * Remaining unauthenticated quota. Used to show *why* a profile is
     * unavailable and when it will work again, instead of a generic error.
     */
    getRateLimit: builder.query<GitHubRateLimit, void>({
      query: () => "rate_limit",
    }),
  }),
});

export const {
  useGetGitHubUserByUsernameQuery,
  useGetGitHubReposQuery,
  useGetGitHubEventsQuery,
  useGetRepoLanguagesQuery,
  useGetGitHubFollowersQuery,
  useGetGitHubGistsQuery,
  useGetRateLimitQuery,
} = githubApi;
