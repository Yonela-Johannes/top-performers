/**
 * Small ink-and-flat-fill illustrations for empty states and the 404.
 * Plain factual text lives beside them; these are aria-hidden moments.
 */

export const AtlasPageIllustration = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 120 96"
    className={`h-24 w-30 ${className}`}
    fill="none"
  >
    {/* Blank atlas page */}
    <rect
      x="18"
      y="12"
      width="84"
      height="72"
      rx="3"
      fill="var(--surface)"
      stroke="var(--ink)"
      strokeWidth="2.5"
    />
    <rect x="26" y="20" width="68" height="2.5" rx="1" fill="var(--rule)" />
    <rect x="26" y="28" width="48" height="2.5" rx="1" fill="var(--rule)" />
    {/* An unfinished dashed route waiting to be drawn */}
    <path
      d="M28 72 C 44 58, 56 82, 72 64 S 92 52, 96 58"
      stroke="var(--tangerine)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="1 7"
    />
    <circle
      cx="28"
      cy="72"
      r="3.5"
      fill="var(--sun)"
      stroke="var(--ink)"
      strokeWidth="2"
    />
    {/* Folded corner */}
    <path
      d="M102 12 L102 26 L88 12 Z"
      fill="var(--surface-muted)"
      stroke="var(--ink)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const LanternIllustration = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 96 96"
    className={`h-20 w-20 ${className}`}
    fill="none"
  >
    {/* Lit lantern outline */}
    <path
      d="M48 14 v6"
      stroke="var(--ink)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <rect
      x="34"
      y="20"
      width="28"
      height="6"
      rx="2"
      fill="var(--sun)"
      stroke="var(--ink)"
      strokeWidth="2.5"
    />
    <path
      d="M32 26 h32 l4 34 a20 20 0 0 1 -40 0 z"
      fill="var(--surface)"
      stroke="var(--ink)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M40 40 a10 14 0 0 0 16 0"
      stroke="var(--tangerine)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="1 6"
    />
    <rect
      x="36"
      y="82"
      width="24"
      height="6"
      rx="2"
      fill="var(--surface-muted)"
      stroke="var(--ink)"
      strokeWidth="2.5"
    />
    <path
      d="M38 88 h20"
      stroke="var(--ink)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const DoorIllustration = ({
  className = "",
}: {
  className?: string;
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 96 96"
    className={`h-20 w-20 ${className}`}
    fill="none"
  >
    {/* Open doorway */}
    <rect
      x="24"
      y="14"
      width="48"
      height="68"
      rx="2"
      fill="var(--surface-muted)"
      stroke="var(--ink)"
      strokeWidth="2.5"
    />
    <rect
      x="32"
      y="22"
      width="32"
      height="60"
      fill="var(--paper)"
      stroke="var(--ink)"
      strokeWidth="2.5"
    />
    {/* Warm light spilling out */}
    <rect
      x="36"
      y="46"
      width="24"
      height="36"
      fill="var(--sun)"
      opacity="0.5"
    />
    <circle cx="58" cy="56" r="2.5" fill="var(--ink)" />
    <path
      d="M32 22 L20 30 M64 22 L76 30"
      stroke="var(--ink)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);
