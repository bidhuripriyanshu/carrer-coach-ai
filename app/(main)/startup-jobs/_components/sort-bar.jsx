"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "matchScore-desc", label: "Best match first" },
  { value: "matchScore-asc", label: "Lowest match first" },
  { value: "teamSize-asc", label: "Team size: small → large" },
  { value: "teamSize-desc", label: "Team size: large → small" },
];

export default function SortBar({ sort, onSortChange, total, filtered }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {filtered < total
          ? `Showing ${filtered} of ${total} startups`
          : `${total} startup${total !== 1 ? "s" : ""} found`}
      </p>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-8 w-[200px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
