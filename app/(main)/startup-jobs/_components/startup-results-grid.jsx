"use client";

import { useMemo, useState } from "react";
import { filterByTiers, getTier } from "@/data/team-size-tiers";
import TeamSizeFilter from "./team-size-filter";
import SortBar from "./sort-bar";
import StartupCard from "./startup-card";
import { SearchX } from "lucide-react";

function applySort(results, sort) {
  const [field, dir] = sort.split("-");
  return [...results].sort((a, b) => {
    const av = a[field] ?? 0;
    const bv = b[field] ?? 0;
    return dir === "asc" ? av - bv : bv - av;
  });
}

export default function StartupResultsGrid({ results }) {
  const [selectedTiers, setSelectedTiers] = useState([]);
  const [sort, setSort] = useState("matchScore-desc");

  const filtered = useMemo(
    () => filterByTiers(results, selectedTiers),
    [results, selectedTiers]
  );

  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card/50 p-4">
        <TeamSizeFilter selected={selectedTiers} onChange={setSelectedTiers} />
      </div>

      <SortBar
        sort={sort}
        onSortChange={setSort}
        total={results.length}
        filtered={sorted.length}
      />

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="font-medium text-sm text-muted-foreground">
            No startups match the selected team size filter
          </p>
          <button
            onClick={() => setSelectedTiers([])}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      )}
    </div>
  );
}
