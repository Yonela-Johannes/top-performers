import { regionTheme } from "@/lib/regionTheme";

/**
 * Region swatch + name. The colour is a chart-legend accent only — the
 * region is always identified by its text, never by colour alone.
 */
export const RegionBadge = ({
  region,
  className = "",
}: {
  region?: string;
  className?: string;
}) => {
  if (!region) return null;
  const theme = regionTheme(region);

  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-secondary ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-3 w-3 shrink-0 border-2 border-[var(--ink)]"
        style={{ background: theme.fill }}
      />
      {region}
    </span>
  );
};
