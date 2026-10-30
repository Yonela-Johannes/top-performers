import { AlertTriangle, RefreshCw } from "lucide-react";


export type GithubFailure =
  | "not-found"
  | "rate-limited"
  | "network"
  | "unknown";

const COPY: Record<GithubFailure, { title: string; body: string }> = {
  "not-found": {
    title: "Profile not found",
    body: "GitHub has no public account at this handle.",
  },
  "rate-limited": {
    title: "GitHub rate limit reached",
    body: "The public API allows 60 requests an hour. Try again in a few minutes.",
  },
  network: {
    title: "Couldn’t reach GitHub",
    body: "The request never completed. Check your connection and retry.",
  },
  unknown: {
    title: "Couldn’t load GitHub data",
    body: "GitHub returned an unexpected response. Retrying usually fixes it.",
  },
};

export const GithubErrorState = ({
  kind = "unknown",
  onRetry,
  compact = false,
}: {
  kind?: GithubFailure;
  onRetry?: () => void;
  compact?: boolean;
}) => {
  const copy = COPY[kind];
  return (
    <div
      role="alert"
      className={`flex flex-col items-center border border-dashed border-border text-center ${
        compact ? "px-4 py-5" : "px-6 py-8"
      }`}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center bg-[hsl(var(--danger-soft))] text-[hsl(var(--danger-ink))]">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{copy.title}</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        {copy.body}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-9 items-center gap-1.5 border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-secondary"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  );
};
