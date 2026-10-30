import { useMemo } from "react";
import { Code2 } from "lucide-react";
import type { GitHubLanguageMap, GitHubRepo } from "@/types";
import { languageColor, toLanguageStats } from "@/lib/github";
import {
  Card,
  CardHeader,
  CardMessage,
  SkeletonBlock,
} from "@/components/common/Card";
import { formatCompactNumber } from "@/lib/format";


const MAX_BARS = 5;

interface LanguageBreakdownProps {
  repos: GitHubRepo[];
  /** Language inventories keyed by `owner/repo`. */
  languagesByRepo: Record<string, GitHubLanguageMap | undefined>;
  isLoading: boolean;
}

export const LanguageBreakdown = ({
  repos,
  languagesByRepo,
  isLoading,
}: LanguageBreakdownProps) => {
  const { stats, repoCount, byteTotal, withLanguages } = useMemo(() => {
    const merged = new Map<string, number>();
    let counted = 0;

    repos.forEach((repo) => {
      const inventory = languagesByRepo[repo.full_name];
      if (!inventory) return;
      counted += 1;
      Object.entries(inventory).forEach(([name, bytes]) => {
        merged.set(name, (merged.get(name) ?? 0) + bytes);
      });
    });

    const byteMap: GitHubLanguageMap = Object.fromEntries(merged);
    const total = [...merged.values()].reduce((sum, value) => sum + value, 0);

    return {
      stats: toLanguageStats(byteMap, MAX_BARS),
      repoCount: repos.length,
      byteTotal: total,
      withLanguages: counted,
    };
  }, [repos, languagesByRepo]);

  return (
    <Card>
      <CardHeader
        eyebrow="Languages"
        title="What they build with"
        icon={<Code2 />}
      />

      {isLoading && !stats.length ? (
        <div className="mt-5 space-y-3" aria-busy="true">
          <SkeletonBlock className="h-2.5 w-full" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <SkeletonBlock className="h-2.5 w-2.5" />
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="ml-auto h-3 w-10" />
            </div>
          ))}
          <p className="sr-only">Loading language statistics</p>
        </div>
      ) : stats.length === 0 ? (
        <CardMessage
          className="mt-5"
          icon={<Code2 />}
          title="No language data"
          description="GitHub reports no language files for these repositories."
        />
      ) : (
        <>
          <div className="mt-5 flex h-2.5 w-full overflow-hidden bg-secondary">
            {stats.map((language) => (
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

          <ul className="mt-4 space-y-2.5">
            {stats.map((language) => (
              <li
                key={language.name}
                className="flex items-center gap-2.5 text-sm"
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: languageColor(language.name) }}
                />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {language.name}
                </span>
                <span className="stat-value text-xs text-muted-foreground">
                  {language.percent.toFixed(1)}%
                </span>
                <span className="stat-value hidden w-16 text-right text-[11px] text-muted-foreground sm:inline">
                  {formatCompactNumber(language.bytes)}B
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
            Across {withLanguages} of {repoCount} recently active repositories ·{" "}
            {formatCompactNumber(byteTotal)}B of code measured.
          </p>
        </>
      )}
    </Card>
  );
};
