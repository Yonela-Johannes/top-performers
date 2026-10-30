import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Compass,
  Github,
  Globe,
  Info,
  Menu,
  Search,
  X,
} from "lucide-react";

import { Brand } from "./Brand";
import { NavSearch } from "./NavSearch";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { GITHUB_URL, SOURCE_NAME } from "@/lib/seo";

/**
 * Header.
 *
 * Structure follows the reference project: brand on the left, product
 * navigation beside it, then a flexible search field, then utilities on the
 * right. Navigation and utilities are separated by a hairline so they never
 * read as one list of unrelated links, and utilities are icon-sized controls
 * rather than text buttons competing with navigation.
 *
 * Active state is a soft tinted pill (the same language the cards use), not a
 * hard border. Mobile gets a disclosure panel instead of a cramped inline row.
 */

const navItemBase =
  "relative inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const navItem = (active: boolean) =>
  active
    ? "bg-foreground text-background"
    : "text-muted-foreground hover:bg-secondary hover:text-foreground";

const utilityButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Globe;
  matches: (pathname: string) => boolean;
};

const NAV: NavItem[] = [
  {
    to: "/",
    label: "Countries",
    icon: Globe,
    matches: (path) => path === "/",
  },
  {
    to: "/explore",
    label: "Explore",
    icon: Compass,
    matches: (path) => path === "/explore" || path.startsWith("/developers"),
  },
  {
    to: "/#how-it-works",
    label: "How it works",
    icon: Info,
    matches: () => false,
  },
];

export const Header = () => {
  const { pathname, hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Country leaderboards live on `/:slug`; they belong under "Countries".
  const onDeveloper = pathname.startsWith("/developer/");
  const onCountry =
    /^\/[^/]+$/.test(pathname) &&
    !["/explore", "/developers"].includes(pathname);

  // A route change closes the mobile panel; so does Escape.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const isActive = (item: NavItem) => {
    if (item.to === "/") return item.matches(pathname) || onCountry;
    return item.matches(pathname);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="shell">
        <div className="flex h-16 min-w-0 items-center gap-3">
          {/* Brand + primary navigation */}
          <Brand responsive />

          <div
            aria-hidden="true"
            className="hidden h-7 w-px shrink-0 bg-border lg:block"
          />

          <nav
            className="hidden shrink-0 items-center gap-0.5 lg:flex"
            aria-label="Primary navigation"
          >
            {NAV.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(navItemBase, navItem(active))}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Search draws the remaining space and stays centred */}
          <NavSearch />

          {/* Utilities */}
          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/developers"
              aria-label="Find a developer"
              className={cn(
                utilityButton,
                "hidden md:inline-flex",
                onDeveloper && "bg-secondary text-foreground",
              )}
            >
              <Search className="h-[17px] w-[17px]" aria-hidden="true" />
            </Link>

            <div
              aria-hidden="true"
              className="hidden h-7 w-px bg-border md:block lg:hidden"
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(utilityButton, "hidden xl:inline-flex")}
                  aria-label="About the index"
                >
                  <Info className="h-[17px] w-[17px]" aria-hidden="true" />
                </button>
              </TooltipTrigger>

              <TooltipContent className="max-w-xs rounded-xl border border-border bg-card p-3 text-foreground shadow-pop">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  About the index
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Rankings are sourced from {SOURCE_NAME} and regenerated
                  whenever the data pipeline runs. Profiles are enriched with
                  public GitHub data. Commit activity is one signal of
                  contribution, not a measure of skill.
                </p>
              </TooltipContent>
            </Tooltip>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(utilityButton, "hidden xl:inline-flex")}
              aria-label="View the project on GitHub"
            >
              <Github className="h-[17px] w-[17px]" aria-hidden="true" />
            </a>

            <div
              aria-hidden="true"
              className="hidden h-7 w-px bg-border md:block"
            />

            {/* Mobile disclosure */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              className={cn(
                utilityButton,
                "lg:hidden",
                menuOpen && "bg-secondary text-foreground",
              )}
            >
              {menuOpen ? (
                <X className="h-[18px] w-[18px]" aria-hidden="true" />
              ) : (
                <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
        >
          <div className="shell py-3">
            <nav
              aria-label="Primary navigation"
              className="flex flex-col gap-1"
            >
              {NAV.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/developers"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                  onDeveloper
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Find a developer
              </Link>
            </nav>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
              <p className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Sourced from {SOURCE_NAME}
              </p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub
                <ArrowUpRight
                  className="h-3 w-3 text-muted-foreground"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};
