import { forwardRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardTone = "default" | "muted" | "brand" | "flush";

const CARD_TONES: Record<CardTone, string> = {
  default: "bg-card text-card-foreground",
  muted: "bg-[var(--surface-muted)] text-card-foreground",
  brand:
    "bg-[var(--surface-muted)] text-card-foreground ring-1 ring-inset ring-brand/25",
  /** No border or shadow — for cards nested inside another card. */
  flush: "border-transparent bg-transparent shadow-none",
};

const CARD_PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
} as const;

interface CardProps {
  as?: ElementType;
  /** Lift slightly on hover; use for cards that are themselves links. */
  interactive?: boolean;
  tone?: CardTone;
  padding?: keyof typeof CARD_PADDING;
  className?: string;
  children: ReactNode;
}

export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      as: Tag = "article",
      interactive = false,
      tone = "default",
      padding = "md",
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <Tag
      ref={ref}
      className={cn(
        "panel relative flex flex-col",
        CARD_TONES[tone],
        padding !== "none" ? CARD_PADDING[padding] : undefined,
        interactive && "panel-hover",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  ),
);
Card.displayName = "Card";

interface CardHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Icon rendered in a small tinted tile before the text block. */
  icon?: ReactNode;
  className?: string;
}

/** Card header: an eyebrow, a title, optional context and an action slot. */
export const CardHeader = ({
  eyebrow,
  title,
  description,
  action,
  icon,
  className,
}: CardHeaderProps) => (
  <div className={cn("flex items-start justify-between gap-3", className)}>
    <div className="flex min-w-0 items-start gap-3">
      {icon ? (
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-[var(--surface-muted)] text-muted-foreground [&>svg]:h-4 [&>svg]:w-4"
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        {eyebrow ? <p className="card-label">{eyebrow}</p> : null}
        <div className="mt-1 min-w-0 text-base font-semibold leading-tight text-foreground">
          {title}
        </div>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

/** Section divider inside a card. */
export const CardDivider = ({ className }: { className?: string }) => (
  <hr className={cn("border-t border-border", className)} />
);

const BADGE_TONES = {
  neutral: "border-border bg-secondary text-ink-secondary",
  brand: "border-brand/30 bg-brand-soft text-brand-soft-ink",
  success:
    "border-[hsl(var(--success)/0.30)] bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]",
  warning:
    "border-[hsl(var(--warning)/0.30)] bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]",
  danger:
    "border-[hsl(var(--danger-ink)/0.30)] bg-[hsl(var(--danger-soft))] text-[hsl(var(--danger-ink))]",
  info: "border-[hsl(var(--info)/0.30)] bg-[hsl(var(--info-soft))] text-[hsl(var(--info))]",
} as const;

const BADGE_SIZES = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-[11px]",
} as const;

interface BadgeProps {
  tone?: keyof typeof BADGE_TONES;
  size?: keyof typeof BADGE_SIZES;
  className?: string;
  children: ReactNode;
  title?: string;
}

/** Compact pill for languages, topics, licences and rank markers. */
export const Badge = ({
  tone = "neutral",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) => (
  <span
    className={cn(
      "inline-flex min-w-0 items-center gap-1 border font-mono font-medium leading-4",
      BADGE_TONES[tone],
      BADGE_SIZES[size],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

const STAT_TONES = {
  default: "border-border bg-[var(--surface-muted)]",
  brand: "border-brand/30 bg-brand-soft",
  plain: "border-border bg-card",
} as const;

/**
 * Metric tile: label above, value below. The reference project's profile
 * stats used this shape — it reads faster than a definition list row and
 * stays aligned across cards of different height.
 */
export const StatTile = ({
  icon,
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: keyof typeof STAT_TONES;
  className?: string;
}) => (
  <div
    className={cn("min-w-0 border p-3", STAT_TONES[tone], className)}
  >
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon ? (
        <span aria-hidden="true" className="[&>svg]:h-3.5 [&>svg]:w-3.5">
          {icon}
        </span>
      ) : null}
      <p className="card-label truncate">{label}</p>
    </div>
    <p className="stat-value mt-1.5 truncate text-xl font-semibold leading-none text-foreground">
      {value}
    </p>
    {hint ? (
      <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);

/** A single statistic inside a card: label on top, value below. */
export const Stat = ({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) => (
  <div className={cn("min-w-0", className)}>
    <dt className="card-label truncate">{label}</dt>
    <dd className="stat-value mt-1 text-lg font-semibold leading-none text-foreground">
      {value}
    </dd>
    {hint ? (
      <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);

/** Resting placeholder matched to the layout it replaces. */
export const SkeletonBlock = ({ className }: { className?: string }) => (
  <span aria-hidden="true" className={cn("skeleton block", className)} />
);

/**
 * Empty / error body inside a card. Dashed rather than solid, so it reads as
 * "nothing here yet" and never as another nested panel.
 */
export const CardMessage = ({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger";
  className?: string;
}) => (
  <div
    className={cn(
      "border border-dashed px-4 py-8 text-center",
      tone === "danger"
        ? "border-[hsl(var(--danger-ink)/0.35)]"
        : "border-border",
      className,
    )}
  >
    {icon ? (
      <span
        aria-hidden="true"
        className={cn(
          "mx-auto mb-3 inline-flex h-9 w-9 items-center justify-center [&>svg]:h-4 [&>svg]:w-4",
          tone === "danger"
            ? "bg-[hsl(var(--danger-soft))] text-[hsl(var(--danger-ink))]"
            : "bg-[var(--surface-muted)] text-muted-foreground",
        )}
      >
        {icon}
      </span>
    ) : null}
    <p className="text-sm font-medium text-foreground">{title}</p>
    {description ? (
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    ) : null}
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
);
