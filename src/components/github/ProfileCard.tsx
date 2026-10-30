import { useMemo } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Code2,
  Github,
  Globe,
  MapPin,
  Twitter,
  Users,
} from "lucide-react";
import type { GitHubRepo, GitHubUser } from "@/types";
import { formatCompactNumber } from "@/lib/format";
import {
  accountAge,
  dominantLanguage,
  languageColor,
  normalizeExternalUrl,
  repoTotals,
} from "@/lib/github";
import { Badge, Card, SkeletonBlock, StatTile } from "@/components/common/Card";
import { FollowersStrip } from "./FollowersStrip";

interface ProfileCardProps {
  username: string;
  user?: GitHubUser;
  repos?: GitHubRepo[];
  followers?: import("@/types").GitHubFollower[];
  isLoading: boolean;
  isFollowersLoading?: boolean;
  ranking?: {
    rank: number;
    commits: number;
    countryName?: string;
    countrySlug?: string;
    flagUrl?: string;
  };
}

/**
 * Developer profile card.
 *
 * Follows the reference project's profile pattern: avatar and identity on one
 * row, a compact row of metric tiles underneath, then a small social strip.
 * The ranking band is TopPerformers' own addition — the GitHub profile and the
 * commit index sit side by side, because that pairing is the point of the page.
 */
export const ProfileCard = ({
  username,
  user,
  repos = [],
  followers = [],
  isLoading,
  isFollowersLoading = false,
  ranking,
}: ProfileCardProps) => {
  const totals = useMemo(() => repoTotals(repos), [repos]);
  const primary = useMemo(() => dominantLanguage(repos), [repos]);
  const age = accountAge(user?.created_at);
  const site = normalizeExternalUrl(user?.blog);
  const handle = user?.login || username;

  if (isLoading && !user) {
    return (
      <Card aria-busy="true">
        <div className="flex items-start gap-4">
          <SkeletonBlock className="h-20 w-20" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-3 w-full max-w-sm" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <SkeletonBlock key={item} className="h-[76px]" />
          ))}
        </div>
        <p className="sr-only">Loading GitHub profile</p>
      </Card>
    );
  }

  const displayName = user?.name || username;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <img
          src={user?.avatar_url || `https://github.com/${handle}.png?size=160`}
          alt=""
          width={80}
          height={80}
          loading="eager"
          className="h-20 w-20 shrink-0 border border-border bg-secondary object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <h1 className="min-w-0 break-words text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
              {displayName}
            </h1>
            <Badge tone="brand">
              <Github className="h-3 w-3" aria-hidden="true" />
              GitHub
            </Badge>
            {primary ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
                <span
                  aria-hidden="true"
                  className="h-2 w-2"
                  style={{ backgroundColor: languageColor(primary.name) }}
                />
                mostly {primary.name}
              </span>
            ) : null}
          </div>

          <a
            href={`https://github.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            @{handle}
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>

          {user?.bio ? (
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-secondary">
              {user.bio}
            </p>
          ) : user ? (
            <p className="mt-3 text-sm text-muted-foreground">
              This developer hasn’t added a GitHub bio.
            </p>
          ) : null}

          <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {user?.company ? (
              <li className="flex min-w-0 items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {user.company.replace(/^@/, "")}
                </span>
              </li>
            ) : null}
            {user?.location ? (
              <li className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{user.location}</span>
              </li>
            ) : null}
            {site ? (
              <li className="flex min-w-0 items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <a
                  href={site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-brand-ink hover:underline"
                >
                  {site.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </li>
            ) : null}
            {user?.twitter_username ? (
              <li className="flex min-w-0 items-center gap-1.5">
                <Twitter className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <a
                  href={`https://twitter.com/${user.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-foreground"
                >
                  @{user.twitter_username}
                </a>
              </li>
            ) : null}
            {age ? (
              <li className="flex min-w-0 items-center gap-1.5">
                <CalendarDays
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">
                  Joined{" "}
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    year: "numeric",
                  }).format(age.joined)}
                </span>
              </li>
            ) : null}
          </ul>
        </div>
        <a
          href={`https://github.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="button-secondary shrink-0 self-start text-xs sm:text-sm"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
          View on GitHub
          <ArrowUpRight
            className="h-3.5 w-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </a>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile
          icon={<Users />}
          label="Followers"
          value={formatCompactNumber(user?.followers ?? 0)}
        />
        <StatTile
          icon={<Users />}
          label="Following"
          value={formatCompactNumber(user?.following ?? 0)}
        />
        <StatTile
          icon={<Code2 />}
          label="Repositories"
          value={formatCompactNumber(user?.public_repos ?? repos.length)}
        />
        <StatTile
          icon={<Github />}
          label="Repo stars"
          value={formatCompactNumber(totals.stars)}
          hint={`${formatCompactNumber(totals.forks)} forks`}
        />
      </dl>

      {ranking ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border border-brand/30 bg-brand-soft px-4 py-3">
          {ranking.flagUrl ? (
            <img
              src={ranking.flagUrl}
              alt=""
              width={28}
              height={20}
              className="h-5 w-7 border border-border object-cover"
            />
          ) : null}
          <p className="min-w-0 flex-1 text-sm text-ink-secondary">
            {ranking.countryName ? (
              <>
                <span className="font-semibold text-foreground">
                  #{ranking.rank}
                </span>{" "}
                in {ranking.countryName}
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">
                  #{ranking.rank}
                </span>{" "}
                in the country index
              </>
            )}
            <span className="text-muted-foreground">
              {" "}
              · {ranking.commits.toLocaleString()} public commits
            </span>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              Ranking from the commit index · profile data from GitHub
            </span>
          </p>
          {ranking.countrySlug ? (
            <a
              href={`/${ranking.countrySlug}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-soft-ink hover:underline"
            >
              Leaderboard
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : null}

      <FollowersStrip
        followers={followers}
        total={user?.followers ?? 0}
        handle={handle}
        isLoading={isFollowersLoading}
      />
    </Card>
  );
};
