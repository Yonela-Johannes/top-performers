import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Globe, Search, X } from "lucide-react";
import { useCountrySearch } from "@/hooks/useCountrySearch";

const inputClassName =
  "h-9 w-full min-w-0 rounded-lg border border-border bg-[var(--surface-muted)] pl-9 pr-9 text-sm font-medium text-foreground outline-none transition-[background-color,border-color,box-shadow] placeholder:font-normal placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-foreground/30 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-search-cancel-button]:appearance-none";

export const NavSearch = () => {
  const inputId = useId();
  const mobileInputId = useId();
  const { search, setSearch, clearSearch } = useCountrySearch();

  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, Escape clears it — a familiar shortcut for a directory.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !typing) {
        event.preventDefault();
        const input =
          desktopInputRef.current && desktopInputRef.current.offsetParent
            ? desktopInputRef.current
            : mobileInputRef.current;
        input?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (mobileOpen) mobileInputRef.current?.focus();
  }, [mobileOpen]);

  // Collapse the mobile panel whenever a search is committed or cleared away.
  useEffect(() => {
    if (!search) setMobileOpen(false);
  }, [search]);

  const renderField = (
    id: string,
    ref: React.RefObject<HTMLInputElement>,
    accessibleLabel: string,
    onDone?: () => void,
  ) => (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        {accessibleLabel}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={ref}
        id={id}
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            clearSearch();
            onDone?.();
          }
          if (event.key === "Enter") onDone?.();
        }}
        placeholder="Search countries..."
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        className={inputClassName}
      />
      {search && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-0.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Clear country search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop / tablet: inline in the header, centred between nav and utilities */}
      <div className="hidden min-w-0 flex-1 items-center justify-center px-1 md:flex">
        <div className="w-full max-w-md">
          {renderField(inputId, desktopInputRef, "Search countries")}
        </div>
      </div>

      {/* Mobile: compact trigger, expands into a panel below the navbar */}
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-expanded={mobileOpen}
        aria-controls={`${mobileInputId}-panel`}
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden ${
          mobileOpen || search
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
        aria-label={mobileOpen ? "Close country search" : "Search countries"}
      >
        <Search className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {mobileOpen && (
        <div
          id={`${mobileInputId}-panel`}
          className="absolute inset-x-0 top-full border-t border-border bg-background px-5 py-3 shadow-pop sm:px-6 md:hidden"
        >
          <div className="flex items-center gap-2">
            {renderField(
              mobileInputId,
              mobileInputRef,
              "Search countries",
              () => setMobileOpen(false),
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Done
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-2.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Globe className="h-3 w-3" aria-hidden="true" />
            Filters the country index
          </p>
        </div>
      )}
    </>
  );
};
