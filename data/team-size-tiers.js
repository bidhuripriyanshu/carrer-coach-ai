export const TEAM_SIZE_TIERS = [
  {
    id: "micro",
    label: "Micro",
    range: [1, 10],
    color: "purple",
    bgClass: "bg-purple-100 dark:bg-purple-900/30",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-300 dark:border-purple-700",
    emoji: "🟣",
    description: "1–10 · Founding hire, high equity",
  },
  {
    id: "seed",
    label: "Seed",
    range: [11, 50],
    color: "blue",
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
    textClass: "text-blue-700 dark:text-blue-300",
    borderClass: "border-blue-300 dark:border-blue-700",
    emoji: "🔵",
    description: "11–50 · Core team, culture-shaping",
  },
  {
    id: "series-a",
    label: "Series A",
    range: [51, 200],
    color: "green",
    bgClass: "bg-green-100 dark:bg-green-900/30",
    textClass: "text-green-700 dark:text-green-300",
    borderClass: "border-green-300 dark:border-green-700",
    emoji: "🟢",
    description: "51–200 · Scaling, career ladders forming",
  },
  {
    id: "series-b",
    label: "Series B",
    range: [201, 500],
    color: "yellow",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
    textClass: "text-yellow-700 dark:text-yellow-300",
    borderClass: "border-yellow-300 dark:border-yellow-700",
    emoji: "🟡",
    description: "201–500 · Growth stage, strong comp",
  },
  {
    id: "late-stage",
    label: "Late Stage",
    range: [501, Infinity],
    color: "orange",
    bgClass: "bg-orange-100 dark:bg-orange-900/30",
    textClass: "text-orange-700 dark:text-orange-300",
    borderClass: "border-orange-300 dark:border-orange-700",
    emoji: "🟠",
    description: "500+ · Pre-IPO, structured teams",
  },
];

/**
 * Returns the tier object for a given team size number.
 */
export function getTier(teamSize) {
  if (!teamSize || teamSize <= 0) return null;
  return (
    TEAM_SIZE_TIERS.find(
      (t) => teamSize >= t.range[0] && teamSize <= t.range[1]
    ) || null
  );
}

/**
 * Filters an array of startup results by the selected tier IDs.
 * If selectedTierIds is empty, returns all results.
 */
export function filterByTiers(results, selectedTierIds) {
  if (!selectedTierIds || selectedTierIds.length === 0) return results;
  return results.filter((r) => {
    const tier = getTier(r.teamSize);
    return tier && selectedTierIds.includes(tier.id);
  });
}
