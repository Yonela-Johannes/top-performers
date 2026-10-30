import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Committer } from "@/types";
import { UserDialog } from "./UserDialog";
import { ArrowUpRight, ExternalLink, UserRound } from "lucide-react";

interface UserTableProps {
  users: Committer[];
  countryName: string;
  countrySlug?: string;
}

export const UserTable = ({
  users,
  countryName,
  countrySlug,
}: UserTableProps) => {
  const [selectedUser, setSelectedUser] = useState<Committer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkedUser = searchParams.get("user");

  const openDialog = (user: Committer) => {
    setSelectedUser(user);
    setDialogOpen(true);
    if (countrySlug) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("user", user.username);
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open && deepLinkedUser) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("user");
      setSearchParams(nextParams, { replace: true });
    }
  };

  useEffect(() => {
    if (!deepLinkedUser || users.length === 0) return;

    const user = users.find(
      (item) => item.username.toLowerCase() === deepLinkedUser.toLowerCase(),
    );

    if (user) {
      setSelectedUser(user);
      setDialogOpen(true);
    }
  }, [deepLinkedUser, users]);

  const rankStyle = (rank: number) => {
    if (rank === 1) return "bg-brand text-brand-foreground";
    if (rank === 2 || rank === 3) return "bg-secondary text-foreground";
    return "text-muted-foreground";
  };

  return (
    <>
      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-foreground px-5 py-4">
          <div>
            <p className="eyebrow">Leaderboard</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              Ranked developers
            </h2>
          </div>
          <span className="rounded-full border-2 border-border bg-secondary/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            {users.length.toLocaleString()} shown
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full table-fixed sm:table-auto">
            <TableHeader>
              <TableRow className="border-b-2 border-foreground hover:bg-transparent">
                <TableHead className="w-16 px-3 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:w-20 sm:px-5">
                  Rank
                </TableHead>
                <TableHead className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Developer
                </TableHead>
                <TableHead className="w-24 text-right text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:w-36 sm:px-5">
                  Commits
                </TableHead>
                <TableHead className="hidden w-16 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:table-cell">
                  Profile
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.username}
                  className={`group border-b-2 border-dashed border-foreground/25 transition-colors last:border-b-0 hover:bg-secondary/60 ${
                    user.rank === 1 ? "bg-brand/[0.055]" : ""
                  }`}
                >
                  <TableCell className="px-3 py-3 text-center sm:px-5">
                    <span
                      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 font-mono text-xs font-medium ${rankStyle(
                        user.rank,
                      )}`}
                    >
                      {user.rank}
                    </span>
                  </TableCell>

                  <TableCell className="min-w-0 py-3 pl-1 pr-2">
                    <Link
                      to={`/developer/${encodeURIComponent(user.username)}${
                        countrySlug ? `?from=${countrySlug}` : ""
                      }`}
                      className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Open the developer page for ${user.username}`}
                    >
                      <img
                        src={user.avatar}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-full border border-border bg-[var(--surface-muted)]"
                        loading="lazy"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-brand-ink">
                            {user.username}
                          </span>
                          <ArrowUpRight
                            className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.realname || "GitHub contributor"}
                        </span>
                      </span>
                    </Link>
                  </TableCell>

                  <TableCell className="py-3 pr-3 text-right sm:px-5">
                    <span className="stat-value text-sm font-medium text-foreground">
                      {user.commits.toLocaleString()}
                    </span>
                  </TableCell>

                  <TableCell className="hidden py-3 text-center sm:table-cell">
                    <span className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => openDialog(user)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Share ${user.username}'s ranking badge`}
                        title="Share badge"
                      >
                        <UserRound className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <a
                        href={user.profile}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Open ${user.username}'s GitHub profile`}
                        title="Open on GitHub"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-foreground/25 bg-secondary/30 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Ranked by public commits in {countryName}. Commit activity is not a
            measure of skill or impact.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            TopPerformers
          </p>
        </div>
      </div>

      {selectedUser && (
        <UserDialog
          user={selectedUser}
          open={dialogOpen}
          key={selectedUser.username}
          onOpenChange={handleDialogOpenChange}
          countrySlug={countrySlug}
          countryName={countryName}
        />
      )}
    </>
  );
};
