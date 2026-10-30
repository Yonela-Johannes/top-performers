import { useGetRepoLanguagesQuery } from "@/api/githubApi";
import type { GitHubLanguageMap, GitHubRepo } from "@/types";

const SLOTS = 4;
const EMPTY = { owner: "", repo: "" };

const queryFor = (repo: GitHubRepo | undefined) => {
  if (!repo) return EMPTY;
  const [owner, name] = repo.full_name.split("/");
  return { owner: owner ?? "", repo: name ?? "" };
};

export const useRepoLanguages = (repos: GitHubRepo[]) => {
  const sample = repos.slice(0, SLOTS);
  const [a, b, c, d] = [0, 1, 2, 3].map((index) => sample[index]);

  const first = useGetRepoLanguagesQuery(queryFor(a), { skip: !a });
  const second = useGetRepoLanguagesQuery(queryFor(b), { skip: !b });
  const third = useGetRepoLanguagesQuery(queryFor(c), { skip: !c });
  const fourth = useGetRepoLanguagesQuery(queryFor(d), { skip: !d });

  const results = [first, second, third, fourth];
  const byRepo: Record<string, GitHubLanguageMap | undefined> = {};
  sample.forEach((repo, index) => {
    byRepo[repo.full_name] = results[index]?.data;
  });

  return {
    byRepo,
    isLoading: sample.length > 0 && results.some((result) => result.isLoading),
    isError: sample.length > 0 && results.every((result) => result.isError),
  };
};
