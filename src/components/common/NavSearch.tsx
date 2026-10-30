import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Globe, Search, X } from "lucide-react";
import { useCountrySearch } from "@/hooks/useCountrySearch";

const inputClassName =
  "h-10 w-full min-w-0 border-2 border-foreground bg-card pl-9 pr-9 text-sm font-medium text-foreground shadow-[3px_3px_0_var(--foreground)] outline-none transition-[background-color,box-shadow] placeholder:font-normal placeholder:text-muted-foreground hover:bg-surface-muted focus-visible:bg-card [&::-webkit-search-cancel-button]:appearance-none";

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
          className="absolute right-0.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Clear country search"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop / tablet: inline in the navbar */}
      <div className="hidden min-w-[7.5rem] flex-1 basis-0 items-center justify-center pl-1 md:flex">
        <div className="w-full max-w-[13rem] lg:max-w-[18rem] xl:max-w-sm">
          {renderField(inputId, desktopInputRef, "Search countries")}
        </div>
      </div>

      {/* Mobile: compact trigger, expands into a panel below the navbar */}
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-expanded={mobileOpen}
        aria-controls={`${mobileInputId}-panel`}
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 transition-[background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden ${
          mobileOpen || search
            ? "border-foreground bg-[var(--tangerine)] text-foreground shadow-[3px_3px_0_var(--foreground)]"
            : "border-transparent text-muted-foreground hover:border-foreground/20 hover:bg-secondary hover:text-foreground"
        }`}
        aria-label={mobileOpen ? "Close country search" : "Search countries"}
      >
        <Search className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {mobileOpen && (
        <div
          id={`${mobileInputId}-panel`}
          className="border-t-2 border-foreground bg-background/95 px-5 py-3 backdrop-blur-md md:hidden"
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
              className="inline-flex h-10 shrink-0 items-center gap-1.5 border-2 border-foreground bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-wide text-foreground shadow-[3px_3px_0_var(--foreground)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
