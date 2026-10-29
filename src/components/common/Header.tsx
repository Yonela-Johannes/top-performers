import { Link, useLocation } from "react-router-dom";
import { Github, Globe, Info } from "lucide-react";
import { Brand } from "./Brand";
import { Switcher } from "./Switcher";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GITHUB_URL, SOURCE_NAME } from "@/lib/seo";

export const Header = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="shell">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6 lg:gap-8">
            <Brand />
            <nav
              className="hidden items-center gap-1 sm:flex"
              aria-label="Primary navigation"
            >
              <Link
                to="/"
                aria-current={isHome ? "page" : undefined}
                className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                  isHome
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                Countries
              </Link>
              <Link
                to="/#how-it-works"
                className="hidden h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground md:inline-flex"
              >
                How it works
              </Link>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="icon-button hidden sm:inline-flex"
                  aria-label="About the rankings"
                >
                  <Info className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Rankings are sourced from {SOURCE_NAME} and refreshed daily.
                Profiles are enriched with public GitHub data.
              </TooltipContent>
            </Tooltip>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="icon-button hidden sm:inline-flex"
              aria-label="View the project author on GitHub"
            >
              <Github className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>

            <Switcher />
          </div>
        </div>
      </div>
    </header>
  );
};
