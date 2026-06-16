import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";
import { getSavedResume, getJobSearchHistory } from "@/actions/startup-jobs";
import StartupJobFinder from "./_components/startup-job-finder";

export const metadata = {
  title: "Startup Job Finder | AI Career Coach",
  description:
    "Find actively-hiring startups that match your resume and job profile. Filter by team size — from micro (1–10) to late-stage (500+).",
};

export default async function StartupJobsPage() {
  // Pre-load resume and history on the server — no loading state needed in client
  let savedResume = null;
  let initialHistory = [];

  try {
    savedResume = await getSavedResume();
  } catch {
    // Not authenticated or no resume — handled gracefully in the client
  }

  try {
    initialHistory = await getJobSearchHistory();
  } catch {
    initialHistory = [];
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page header */}
      <header className="space-y-3 border-b pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="secondary"
            className="text-xs font-semibold uppercase tracking-wider"
          >
            Jobs
          </Badge>
          <Rocket className="h-4 w-4 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight gradient-title md:text-6xl">
          Startup Job Finder
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Paste your resume and tell us your ideal role. Our AI matches you with{" "}
          <strong>real, actively-hiring startups</strong> — filterable by team
          size so you can target exactly the stage and culture you want.
        </p>

        {/* Tier legend */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: "1–10 · Micro", emoji: "🟣" },
            { label: "11–50 · Seed", emoji: "🔵" },
            { label: "51–200 · Series A", emoji: "🟢" },
            { label: "201–500 · Series B", emoji: "🟡" },
            { label: "500+ · Late Stage", emoji: "🟠" },
          ].map((t) => (
            <span
              key={t.label}
              className="flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {t.emoji} {t.label}
            </span>
          ))}
        </div>
      </header>

      {/* Main module — client component */}
      <StartupJobFinder
        savedResume={savedResume}
        initialHistory={initialHistory}
      />
    </div>
  );
}
