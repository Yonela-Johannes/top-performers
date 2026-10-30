import { regionTheme } from "@/lib/regionTheme";

/**
 * Passport-style stamp in the existing dashed stamp language: country name,
 * region (always as text) and a real data date. Rotate only — it is an object.
 */
interface StampProps {
  country: string;
  region?: string;
  date?: string; // already formatted
  className?: string;
}

export const Stamp = ({
  country,
  region,
  date,
  className = "",
}: StampProps) => {
  const theme = regionTheme(region);

  return (
    <span
      className={`stamp-badge !rotate-[2deg] !bg-paper !px-3 !py-1.5 !text-[11px] max-w-full flex-wrap ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 rounded-full border-2"
        style={{ borderColor: "var(--ink)", background: theme.fill }}
      />
      <span className="whitespace-nowrap">{country}</span>
      {region && (
        <span className="whitespace-nowrap opacity-70">· {region}</span>
      )}
      {date && <span className="whitespace-nowrap">· {date}</span>}
    </span>
  );
};
