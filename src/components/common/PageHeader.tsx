import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Facts about the page (dataset date, counts) rendered under the title. */
  meta?: ReactNode;
  className?: string;
  children?: ReactNode;
}) => (
  <section
    aria-labelledby="page-heading"
    className={cn(
      "relative border-b border-border pb-8 pt-4 sm:pb-10",
      className,
    )}
  >
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1
          id="page-heading"
          className="mt-2 break-words font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.025em] text-foreground"
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-secondary sm:text-base sm:leading-7">
            {description}
          </p>
        ) : null}
        {meta ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {meta}
          </div>
        ) : null}
        {children}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  </section>
);

/**
 * Section heading used above grids of cards — an eyebrow, a display title and
 * an optional action that aligns to the baseline of the title.
 */
export const SectionHeading = ({
  id,
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-wrap items-end justify-between gap-x-4 gap-y-3",
      className,
    )}
  >
    <div className="min-w-0">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2
        id={id}
        className="mt-1 font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-foreground sm:text-[1.75rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

/** Breadcrumb trail shared by inner pages. */
export const Breadcrumbs = ({
  items,
  className,
}: {
  items: { label: ReactNode; to?: string; icon?: ReactNode }[];
  className?: string;
}) => (
  <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
    <ol className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <li
            key={typeof item.label === "string" ? item.label : index}
            className={cn(
              "flex min-w-0 items-center gap-2",
              last && "truncate font-semibold text-foreground",
            )}
          >
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.to && !last ? (
              <a
                href={item.to}
                className="inline-flex shrink-0 items-center gap-1.5 rounded font-medium underline-offset-4 hover:text-foreground hover:underline"
              >
                {item.icon}
                {item.label}
              </a>
            ) : (
              <span
                aria-current={last ? "page" : undefined}
                className="truncate"
              >
                {item.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
