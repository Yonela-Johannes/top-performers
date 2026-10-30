import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw, ServerCrash, UserX } from "lucide-react";
import type { GithubFailureKind } from "@/api/githubApi";

const COPY: Record<
  GithubFailureKind,
  { title: string; body: ReactNode; icon: typeof AlertTriangle }
> = {
  "not-found": {
    title: "Profile not found",
    body: "GitHub has no public account at this handle. It may have been renamed or deleted.",
    icon: UserX,
  },
  "rate-limited": {
    title: "GitHub is rate-limiting this browser",
    body: "The public GitHub API allows 60 requests an hour per IP. The country leaderboards are unaffected and this profile will load again shortly.",
    icon: ServerCrash,
  },
  network: {
    title: "Couldn’t reach GitHub",
    body: "The request never completed. Check your connection and try again.",
    icon: AlertTriangle,
  },
  unknown: {
    title: "Couldn’t load GitHub data",
    body: "GitHub returned an unexpected response. Retrying usually fixes it.",
    icon: AlertTriangle,
  },
};

export const GithubErrorState = ({
  kind = "unknown",
  onRetry,
  isRetrying,
  resetAt,
  children,
}: {
  kind?: GithubFailureKind;
  onRetry?: () => void;
  isRetrying?: boolean;
  /** Unix seconds at which the API quota resets. */
  resetAt?: number;
  children?: ReactNode;
}) => {
  const copy = COPY[kind];
  const Icon = copy.icon;
  const tone =
    kind === "not-found"
      ? "bg-[var(--surface-muted)] text-muted-foreground"
      : kind === "rate-limited"
        ? "bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]"
        : "bg-[hsl(var(--danger-soft))] text-[hsl(var(--danger-ink))]";

  const resetLabel = resetAt
    ? new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(resetAt * 1000))
    : null;

  return (
    <div role="alert" className="panel mx-auto max-w-xl px-6 py-12 text-center">
      <span
        className={`mx-auto inline-flex h-12 w-12 items-center justify-center ${tone}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="card-label mt-4">GitHub</p>
      <h1 className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-foreground">
        {copy.title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        {copy.body}
        {resetLabel ? (
          <>
            {" "}
            Quota resets around{" "}
            <strong className="text-foreground">{resetLabel}</strong>.
          </>
        ) : null}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="button-primary"
            disabled={isRetrying}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {isRetrying ? "Retrying…" : "Try again"}
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
};
