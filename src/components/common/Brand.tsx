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
      "relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md",
      className,
    )}
    aria-hidden="true"
  >
    <img
      src="/logo.png"
      alt={`${SITE_NAME} logo`}
      className={cn(
        "h-full w-full object-contain p-0.5",
        animated && "transition-transform duration-300 hover:scale-105",
      )}
    />
  </span>
);

interface BrandProps {
  className?: string;
  responsive?: boolean;
  inverted?: boolean;
}

export const Brand = ({
  className,
  responsive = false,
}: BrandProps) => (
  <Link
    to="/"
    aria-label={`${SITE_NAME} home`}
    className={cn(
      "group inline-flex min-w-0 items-center gap-2.5",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      className,
    )}
  >
    <BrandMark />
    <span
      className={cn(
        "font-display text-[17px] font-extrabold leading-none tracking-[-0.01em]",
        responsive && "hidden min-[420px]:block",
      )}
    >
      TopPerformers
    </span>
  </Link>
);

export const BrandKey = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <BrandMark animated />
    <div className="min-w-0">
      <p className="font-display text-sm font-extrabold leading-none tracking-[0.02em] text-foreground">
        TopPerformers
      </p>
      <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
        Open-source index
      </p>
    </div>
  </div>
);
