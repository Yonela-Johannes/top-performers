import { Link, useLocation } from "react-router-dom";
import { Github, Globe, Info, ArrowUpRight } from "lucide-react";

import { Brand } from "./Brand";
import { Switcher } from "./Switcher";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { GITHUB_URL, SOURCE_NAME } from "@/lib/seo";

export const Header = () => {
  const { pathname, hash } = useLocation();

  const isHome = pathname === "/";
  const isHowItWorks = isHome && hash === "#how-it-works";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur-md">
      <div className="shell">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-5">
          {/* Brand and primary navigation */}
          <div className="flex min-w-0 items-center gap-4 sm:gap-6 lg:gap-9">
            <Brand />

            <div
              aria-hidden="true"
              className="hidden h-7 w-px bg-foreground/20 sm:block"
            />

            <nav
              className="flex items-center gap-1"
              aria-label="Primary navigation"
            >
              <Link
                to="/"
                aria-current={isHome && !isHowItWorks ? "page" : undefined}
                className={`group relative inline-flex h-10 items-center gap-2 border-2 px-3 font-mono text-[11px] font-bold uppercase tracking-wide transition-[background-color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-3.5 ${
                  isHome && !isHowItWorks
                    ? "border-foreground bg-[var(--tangerine)] text-foreground shadow-[3px_3px_0_var(--foreground)]"
                    : "border-transparent text-muted-foreground hover:border-foreground/20 hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Globe
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>Countries</span>
              </Link>

              <Link
                to="/#how-it-works"
                aria-current={isHowItWorks ? "location" : undefined}
                className={`hidden h-10 items-center gap-2 border-2 px-3 font-mono text-[11px] font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:inline-flex ${
                  isHowItWorks
                    ? "border-foreground bg-secondary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-foreground/20 hover:bg-secondary hover:text-foreground"
                }`}
              >
                How it works
              </Link>
            </nav>
          </div>

          {/* Utilities */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground xl:block">
              Open source / Worldwide
            </span>

            <div
              aria-hidden="true"
              className="hidden h-7 w-px bg-foreground/20 xl:block"
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center border-2 border-transparent text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="About the rankings"
                >
                  <Info
                    className="h-[18px] w-[18px]"
                    aria-hidden="true"
                  />
                </button>
              </TooltipTrigger>

              <TooltipContent className="max-w-xs border-2 border-foreground bg-card p-3 text-foreground shadow-[3px_3px_0_var(--foreground)]">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider">
                  About the index
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Rankings are sourced from {SOURCE_NAME} and refreshed daily.
                  Profiles are enriched with public GitHub data. Commit activity
                  is one signal of contribution, not a measure of skill.
                </p>
              </TooltipContent>
            </Tooltip>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 border-2 border-foreground bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-wide text-foreground shadow-[3px_3px_0_var(--foreground)] transition-[box-shadow,transform,background-color] hover:bg-secondary active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
              aria-label="View the project on GitHub"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">GitHub</span>
              <ArrowUpRight
                className="hidden h-3 w-3 lg:inline"
                aria-hidden="true"
              />
            </a>

            <Switcher />
          </div>
        </div>
      </div>
    </header>
  );
};