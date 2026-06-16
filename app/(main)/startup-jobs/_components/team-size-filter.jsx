"use client";

import { TEAM_SIZE_TIERS } from "@/data/team-size-tiers";
import { cn } from "@/lib/utils";

export default function TeamSizeFilter({ selected, onChange }) {
  const toggle = (id) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  };

  const clearAll = () => onChange([]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Team Size
        </p>
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {TEAM_SIZE_TIERS.map((tier) => {
          const active = selected.includes(tier.id);
          return (
            <button
              key={tier.id}
              onClick={() => toggle(tier.id)}
              title={tier.description}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                active
                  ? `${tier.bgClass} ${tier.textClass} ${tier.borderClass} shadow-sm`
                  : "border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:bg-muted/60"
              )}
            >
              <span>{tier.emoji}</span>
              <span>{tier.label}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing:{" "}
          {TEAM_SIZE_TIERS.filter((t) => selected.includes(t.id))
            .map((t) => t.description)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
