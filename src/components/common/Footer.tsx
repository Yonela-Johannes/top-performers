import { ArrowUpRight, Github, Globe, Linkedin } from "lucide-react";
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
  { label: "All countries", to: "/", external: false },
  { label: "How rankings work", to: "/#how-it-works", external: false },
];

const developerLinks = [
  { label: "Website", href: AUTHOR_URL, icon: Globe },
  { label: "GitHub", href: GITHUB_URL, icon: Github },
  { label: "LinkedIn", href: LINKEDIN_URL, icon: Linkedin },
];

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="shell py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
          <div className="max-w-sm">
            <Brand />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              An independent index of the people shipping the world's open
              source, ranked by public commit activity in every country.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Updated daily · {year}
            </p>
          </div>

          <div>
            <p className="eyebrow">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={SOURCE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Data source: {SOURCE_NAME}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">Developer</p>
            <ul className="mt-4 space-y-2.5">
              {developerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <link.icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} TopPerformers. Built by{" "}
            <a
              href={AUTHOR_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Rensith Udara Gonalagoda
            </a>
            .
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em]">
            Open source · MIT licence
          </p>
        </div>
      </div>
    </footer>
  );
};
