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

    getGitHubFollowers: builder.query<
      GitHubFollower[],
      { username: string; perPage?: number }
    >({
      query: ({ username, perPage = 12 }) =>
        `users/${encodeURIComponent(username)}/followers?per_page=${perPage}`,
    }),

    getGitHubGists: builder.query<
      GitHubGist[],
      { username: string; perPage?: number }
    >({
      query: ({ username, perPage = 6 }) =>
        `users/${encodeURIComponent(username)}/gists?per_page=${perPage}`,
    }),

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
