import { ArrowUpRight, FileCode2, MessageSquare } from "lucide-react";
import type { GitHubGist } from "@/types";
import { relativeTime } from "@/lib/github";
import {
  Badge,
  Card,
  CardHeader,
  CardMessage,
  SkeletonBlock,
} from "@/components/common/Card";

export const GistsCard = ({
  gists = [],
  isLoading,
  isError,
  handle,
}: {
  gists?: GitHubGist[];
  isLoading: boolean;
  isError: boolean;
  handle: string;
}) => (
  <Card>
    <CardHeader
      eyebrow="Snippets"
      title="Public gists"
      icon={<FileCode2 />}
      action={
        <a
          href={`https://gist.github.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          All
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </a>
      }
    />

    {isLoading ? (
      <div className="mt-4 space-y-3" aria-busy="true">
        {[0, 1, 2].map((row) => (
          <div key={row} className="space-y-1.5">
            <SkeletonBlock className="h-3.5 w-2/3" />
            <SkeletonBlock className="h-2.5 w-1/3" />
          </div>
        ))}
      </div>
    ) : isError ? (
      <CardMessage
        className="mt-4"
        tone="danger"
        title="Gists unavailable"
        description="GitHub didn’t return gists for this account just now."
      />
    ) : gists.length === 0 ? (
      <CardMessage
        className="mt-4"
        icon={<FileCode2 />}
        title="No public gists"
        description="This developer keeps their snippets in repositories."
      />
    ) : (
      <ul className="mt-4 divide-y divide-border">
        {gists.slice(0, 4).map((gist) => {
          const files = Object.values(gist.files ?? {});
          const primary = files[0];
          const language = files.find((file) => file.language)?.language;
          return (
            <li key={gist.id}>
              <a
                href={gist.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group -mx-2 flex items-start gap-3 px-2 py-2.5 transition-colors hover:bg-[var(--surface-muted)]"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-[var(--surface-muted)] text-muted-foreground">
                  <FileCode2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {gist.description?.trim() ||
                      primary?.filename ||
                      "Untitled gist"}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                    {language ? (
                      <Badge size="sm" tone="neutral">
                        {language}
                      </Badge>
                    ) : null}
                    <span>{Object.keys(gist.files ?? {}).length} file(s)</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={gist.updated_at}>
                      {relativeTime(gist.updated_at)}
                    </time>
                    {gist.comments > 0 ? (
                      <span className="inline-flex items-center gap-0.5">
                        <MessageSquare className="h-3 w-3" aria-hidden="true" />
                        {gist.comments}
                      </span>
                    ) : null}
                  </span>
                </span>
                <ArrowUpRight
                  className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </a>
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);
