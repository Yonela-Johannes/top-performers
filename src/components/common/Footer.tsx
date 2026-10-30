import {
  ArrowUpRight,
  Github,
  Globe,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Brand } from "./Brand";

import {
  AUTHOR_URL,
  GITHUB_URL,
  LINKEDIN_URL,
  SOURCE_NAME,
  SOURCE_URL,
} from "@/lib/seo";

const exploreLinks = [
  { label: "All countries", to: "/" },
  { label: "How rankings work", to: "/#how-it-works" },
];

const developerLinks = [
  { label: "Website", href: AUTHOR_URL, icon: Globe },
  { label: "GitHub", href: GITHUB_URL, icon: Github },
  { label: "LinkedIn", href: LINKEDIN_URL, icon: Linkedin },
];

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t-2 border-foreground bg-[#201D23] text-[#FFFCF9]">
      {/* Decorative top edge */}
      <div
        aria-hidden="true"
        className="h-2 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--sun) 0px, var(--sun) 7px, #201D23 7px, #201D23 14px)",
        }}
      />

      <div className="shell">
        {/* Main footer */}
        <div className="grid gap-12 py-14 md:grid-cols-[1.5fr_1fr_1fr] md:gap-10 lg:py-20">
          {/* Brand introduction */}
          <div className="max-w-md">
            <Brand />

            <p className="mt-6 max-w-sm text-sm leading-7 text-[#D8D1DD]">
              A worldwide look at who's building in open source. Discover
              developers, explore countries, and follow the work happening
              across the community.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 border border-[#625A68] px-3 py-2">
              <span
                className="h-2 w-2 rounded-full bg-[#A6D99B]"
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#D8D1DD]">
                Independent project
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold text-[var(--tangerine)]">
                01
              </span>
              <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#D8D1DD]">
                Explore
              </h2>
              <div className="h-px flex-1 bg-[#48434F]" />
            </div>

            <ul className="space-y-4">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-2 text-sm text-[#D8D1DD] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tangerine)]"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 -translate-y-0.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}

              <li className="pt-2">
                <a
                  href={SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2 text-sm text-[#D8D1DD] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tangerine)]"
                >
                  <span>
                    Data source
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-[#A89EAE]">
                      {SOURCE_NAME}
                    </span>
                  </span>
                  <ExternalLink
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold text-[var(--tangerine)]">
                02
              </span>
              <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#D8D1DD]">
                The developer
              </h2>
              <div className="h-px flex-1 bg-[#48434F]" />
            </div>

            <ul className="space-y-2">
              {developerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between border border-transparent px-3 py-2.5 text-sm text-[#D8D1DD] transition-colors hover:border-[#625A68] hover:bg-[#2D2932] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tangerine)]"
                  >
                    <span className="flex items-center gap-3">
                      <link.icon
                        className="h-4 w-4 text-[#A89EAE] transition-colors group-hover:text-[var(--tangerine)]"
                        aria-hidden="true"
                      />
                      {link.label}
                    </span>

                    <ArrowUpRight
                      className="h-3.5 w-3.5 opacity-50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Closing statement */}
        <div className="relative overflow-hidden border-y-2 border-[#48434F] py-8 sm:py-10">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-8 select-none font-display text-8xl font-black uppercase leading-none text-white/[0.035] sm:text-[10rem]"
          >
            BUILD
          </span>

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--tangerine)]">
                The open-source community
              </p>
              <h2 className="mt-2 max-w-xl font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-4xl">
                Built in the open.
                <br />
                <span className="text-[#D8D1DD]">Growing everywhere.</span>
              </h2>
            </div>

            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 border-2 border-[#FFFCF9] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-white transition-[background-color,color,transform] hover:bg-[#FFFCF9] hover:text-[#201D23] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tangerine)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#201D23]"
            >
              Explore the source
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Legal and attribution */}
        <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs leading-5 text-[#D8D1DD]">
              © {year} TopPerformers. Built by{" "}
              <a
                href={AUTHOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white underline decoration-[#625A68] underline-offset-4 transition-colors hover:decoration-[var(--tangerine)]"
              >
                Yonela Johannes
              </a>
              .
            </p>

            <p className="max-w-xl text-[11px] leading-5 text-[#A89EAE]">
              Not affiliated with or endorsed by GitHub. Ranking data is
              sourced from{" "}
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-white"
              >
                {SOURCE_NAME}
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-[#625A68] px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#D8D1DD]">
              Open source
            </span>
            <span className="border border-[#625A68] px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#D8D1DD]">
              MIT licence
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#A89EAE]">
              {year}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};