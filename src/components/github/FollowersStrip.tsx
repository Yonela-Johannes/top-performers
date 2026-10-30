import { ArrowUpRight } from "lucide-react";
import type { GitHubFollower } from "@/types";
import { SkeletonBlock } from "@/components/common/Card";

export const FollowersStrip = ({
  followers,
  total,
  handle,
  isLoading,
}: {
  followers: GitHubFollower[];
  total: number;
  handle: string;
  isLoading?: boolean;
}) => {
  if (!isLoading && followers.length === 0) return null;

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="card-label">Recent followers</p>
        <a
          href={`https://github.com/${handle}?tab=followers`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {total > 0 ? `${total.toLocaleString()} followers` : "Followers"}
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>

      {isLoading && followers.length === 0 ? (
        <div className="flex flex-wrap gap-1.5" aria-busy="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-8 w-8" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {followers.map((follower) => (
            <li key={follower.id}>
              <a
                href={follower.html_url}
                target="_blank"
                rel="noopener noreferrer"
                title={`@${follower.login}`}
                className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <img
                  src={follower.avatar_url}
                  alt={`@${follower.login}`}
                  width={32}
                  height={32}
                  loading="lazy"
                  className="h-8 w-8 border border-border bg-secondary object-cover transition-transform duration-150 group-hover:-translate-y-0.5"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
