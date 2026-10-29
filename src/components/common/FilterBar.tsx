import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toast } from "@/components/common";
import type { SortOption } from "@/types";

interface FilterBarProps {
  sortBy: SortOption;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "commits-desc", label: "Most commits" },
  { value: "commits-asc", label: "Fewest commits" },
  { value: "alphabetical-asc", label: "Name A–Z" },
  { value: "alphabetical-desc", label: "Name Z–A" },
];

export const FilterBar = ({ refetch, sortBy, isFetching }: FilterBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [internalLoading, setInternalLoading] = useState(false);
  const busy = isFetching || internalLoading;

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "commits-desc" && key === "sort") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleRefetch = async () => {
    setInternalLoading(true);
    try {
      const result = (await refetch()) as { error?: unknown } | undefined;
      if (result?.error) {
        Toast("error", "Couldn't refresh the rankings");
      } else {
        Toast("success", "Rankings are up to date");
      }
    } catch {
      Toast("error", "Couldn't refresh the rankings");
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <SlidersHorizontal
          className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
          aria-hidden="true"
        />
        <label htmlFor="leaderboard-sort" className="sr-only">
          Sort leaderboard
        </label>
        <Select
          value={sortBy}
          onValueChange={(value) => updateParam("sort", value)}
        >
          <SelectTrigger
            id="leaderboard-sort"
            className="h-10 w-[150px] rounded-lg border-border bg-card text-sm font-medium text-foreground shadow-sm focus:ring-2 focus:ring-ring/20 sm:w-[170px]"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleRefetch}
            disabled={busy}
            className="icon-button"
            aria-label="Refresh rankings"
          >
            <RefreshCw
              className={`h-4 w-4 ${busy ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>Refresh rankings</TooltipContent>
      </Tooltip>
    </div>
  );
};
