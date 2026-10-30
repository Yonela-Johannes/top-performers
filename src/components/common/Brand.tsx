import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/seo";

export const BrandMark = ({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) => (
  <span
    className={cn(
      "relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden",
      "bg-[var(--ink)] text-[var(--paper)]",
      "ring-1 ring-inset ring-black/10",
      className,
    )}
    aria-hidden="true"
  >
    <span
      className="pointer-events-none absolute inset-0 opacity-90"
      style={{
        backgroundImage:
          "radial-gradient(120% 90% at 100% 0%, hsl(var(--brand) / 0.9) 0%, transparent 55%)",
      }}
    />
    <svg
      viewBox="0 0 64 64"
      className="relative h-[22px] w-[22px]"
      fill="none"
      focusable="false"
    >
      <rect
        x="12"
        y="37"
        width="9"
        height="15"
        rx="2.5"
        fill="currentColor"
        opacity="0.65"
      />
      <rect
        x="27"
        y="26"
        width="9"
        height="26"
        rx="2.5"
        fill="currentColor"
        opacity="0.85"
      />
      <rect
        x="42"
        y="14"
        width="9"
        height="38"
        rx="2.5"
        fill="hsl(var(--brand))"
        className={
          animated
            ? "origin-bottom animate-[brandBar_600ms_var(--ease)_both]"
            : undefined
        }
      />
    </svg>
  </span>
);

interface BrandProps {
  className?: string;
  /** Hide the wordmark on the narrowest screens while keeping it readable. */
  responsive?: boolean;
  inverted?: boolean;
}

export const Brand = ({
  className,
  responsive = false,
  inverted = false,
}: BrandProps) => (
  <Link
    to="/"
    aria-label={`${SITE_NAME} home`}
    className={cn(
      "group inline-flex min-w-0 items-center gap-2.5",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      inverted && "focus-visible:ring-offset-[var(--band-bg)]",
      className,
    )}
  >
    <BrandMark />
    <span
      className={cn(
        "font-display text-[17px] font-extrabold uppercase leading-none tracking-[-0.01em]",
        inverted ? "text-[var(--band-fg)]" : "text-foreground",
        responsive && "hidden min-[420px]:block",
      )}
    >
      TopPerformers
    </span>
  </Link>
);

/** Full brand lockup used on standalone pages (404, developer profile). */
export const BrandKey = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <BrandMark animated />
    <div className="min-w-0">
      <p className="font-display text-sm font-extrabold uppercase leading-none tracking-[0.02em] text-foreground">
        TopPerformers
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Open-source index
      </p>
    </div>
  </div>
);
