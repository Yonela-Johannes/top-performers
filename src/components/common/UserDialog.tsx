import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowUpRight, BadgeCheck, Check, Copy, MapPin } from "lucide-react";
import { ErrorMessage } from "./ErrorMessage";
import type { Committer } from "@/types";
import { useGetGitHubUserByUsernameQuery } from "@/api";
import { useMemo, useState } from "react";
import { Toast } from "./Toast";
import { absoluteUrl, SOURCE_NAME } from "@/lib/seo";

interface UserDialogProps {
  user: Committer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countrySlug?: string;
  countryName?: string;
}

export const UserDialog = ({
  user,
  open,
  onOpenChange,
  countrySlug,
  countryName,
}: UserDialogProps) => {
  const [badgeType, setBadgeType] = useState<"user" | "org">("user");
  const [copied, setCopied] = useState(false);
  const {
    data: userInfo,
    error,
    isLoading,
  } = useGetGitHubUserByUsernameQuery(user.username, {
    skip: !open,
    refetchOnMountOrArgChange: false,
  });

  const badgeSubject = user.username;
  const badgeBaseUrl = badgeType === "user" ? "user-badge" : "org-badge";
  const committersBadgeUrl = countrySlug
    ? `https://${badgeBaseUrl}.committers.top/${countrySlug}/${badgeSubject}.svg`
    : "";
  const originalBadgeLink = countrySlug
    ? `https://${badgeBaseUrl}.committers.top/${countrySlug}/${badgeSubject}`
    : "";
  const badgeLink = countrySlug
    ? absoluteUrl(`/${countrySlug}?user=${encodeURIComponent(badgeSubject)}`)
    : "";
  const badgeColor =
    user.rank === 1
      ? "d4af37"
      : user.rank === 2
        ? "a8b0b9"
        : user.rank === 3
          ? "c07a45"
          : "a3d63b";
  const badgeMessage = `${countryName || countrySlug || "Country"} #${user.rank} · public commits`;
  const encodedMessage = encodeURIComponent(badgeMessage)
    .replace(/-/g, "--")
    .replace(/%20/g, "_");
  const badgeUrl = countrySlug
    ? `https://img.shields.io/badge/TopPerformers-${encodedMessage}-${badgeColor}?style=flat&logo=github&logoColor=white&labelColor=111318&color=${badgeColor}`
    : "";
  const badgeMarkdown = useMemo(
    () =>
      badgeUrl && badgeLink
        ? `[![TopPerformers badge](${badgeUrl})](${badgeLink})`
        : "",
    [badgeLink, badgeUrl],
  );

  const copyBadge = async () => {
    if (!badgeMarkdown) return;
    try {
      await navigator.clipboard.writeText(badgeMarkdown);
      setCopied(true);
      Toast("success", "Badge markdown copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      Toast("error", "Could not access the clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,640px)] max-w-none gap-0 overflow-hidden rounded-xl border-border bg-card p-0 shadow-pop">
        <DialogHeader className="border-b-2 border-foreground px-6 py-5 text-left">
          <p className="eyebrow">Contributor profile</p>
          <DialogTitle className="mt-1 font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-foreground">
            {userInfo?.name || user.username}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            @{user.username}
            {countryName ? ` · ${countryName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {isLoading && (
            <div className="space-y-5" aria-busy="true" aria-live="polite">
              <div className="flex items-center gap-4">
                <div className="skeleton h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-40" />
                  <div className="skeleton h-3.5 w-28" />
                </div>
              </div>
              <div className="skeleton h-14 w-full" />
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="skeleton h-16" />
                ))}
              </div>
              <p className="sr-only">Loading GitHub profile</p>
            </div>
          )}

          {!isLoading && error && (
            <ErrorMessage
              title="Couldn't load this profile"
              message="GitHub may be rate-limiting requests. Try again in a moment."
            />
          )}

          {userInfo && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <img
                  src={userInfo.avatar_url}
                  alt=""
                  className="h-16 w-16 rounded-full border-2 border-foreground bg-muted"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-semibold text-foreground">
                    {userInfo.name || userInfo.login}
                  </h3>
                  <a
                    href={userInfo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline"
                  >
                    View on GitHub
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  {userInfo.location && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {userInfo.location}
                    </p>
                  )}
                </div>
              </div>

              {userInfo.bio && (
                <p className="text-sm leading-6 text-muted-foreground">
                  {userInfo.bio}
                </p>
              )}

              <dl className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border">
                {[
                  { label: "Followers", value: userInfo.followers },
                  { label: "Following", value: userInfo.following },
                  { label: "Repositories", value: userInfo.public_repos },
                ].map((stat) => (
                  <div key={stat.label} className="px-3 py-3 text-center">
                    <dd className="stat-value text-lg font-medium text-foreground">
                      {stat.value.toLocaleString()}
                    </dd>
                    <dt className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>

              {countrySlug && (
                <section className="rounded-xl border border-border bg-secondary/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <BadgeCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-ink"
                        aria-hidden="true"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          TopPerformers badge
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Share your ranking and link back to this profile.
                        </p>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-2 rounded-lg border border-border bg-card p-0.5"
                      role="group"
                      aria-label="Badge type"
                    >
                      {(["user", "org"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setBadgeType(type)}
                          aria-pressed={badgeType === type}
                          className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                            badgeType === type
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-[#0e1014] p-3">
                    <img
                      src={badgeUrl}
                      alt={`TopPerformers badge for ${user.username}`}
                      className="h-5 max-w-none"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={originalBadgeLink || committersBadgeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
                    >
                      View source badge on {SOURCE_NAME}
                    </a>
                    <a
                      href={user.profile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Rank #{user.rank}
                    </a>
                  </div>

                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                    <code className="block max-h-24 min-w-0 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-card px-3 py-2 font-mono text-[11px] leading-5 text-muted-foreground">
                      {badgeMarkdown}
                    </code>
                    <button
                      type="button"
                      onClick={copyBadge}
                      className="flex min-h-10 w-11 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-90"
                      aria-label="Copy badge markdown"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="grid border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
