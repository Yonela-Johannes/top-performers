import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const BrandMark = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border-2 border-foreground bg-brand text-brand-foreground shadow-[2px_2px_0_var(--ink)]",
      className,
    )}
    aria-hidden="true"
  >
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
      <rect x="3" y="14" width="4" height="7" rx="1.2" fill="currentColor" />
      <rect x="10" y="9" width="4" height="12" rx="1.2" fill="currentColor" />
      <rect
        x="17"
        y="3"
        width="4"
        height="18"
        rx="1.2"
        fill="hsl(var(--brand))"
      />
    </svg>
  </span>
);

export const Brand = ({ className }: { className?: string }) => (
  <Link
    to="/"
    className={cn(
      "group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      className,
    )}
    aria-label="TopPerformers home"
  >
    <BrandMark className="transition-transform duration-300 group-hover:-rotate-3" />
    <span className="font-display text-[22px] font-extrabold uppercase leading-none tracking-[-0.02em] text-foreground">
      TopPerformers
    </span>
  </Link>
);
