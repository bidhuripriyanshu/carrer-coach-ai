"use client";

import { useState } from "react";
import { Loader2, Rocket, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findStartups, getJobSearchById } from "@/actions/startup-jobs";
import ResumeInput from "./resume-input";
import JobProfileForm from "./job-profile-form";
import StartupResultsGrid from "./startup-results-grid";
import StartupSkeleton from "./startup-skeleton";
import SearchHistoryPanel from "./search-history-panel";

const DEFAULT_PROFILE = {
  targetRole: "",
  techStack: "",
  experience: "",
  workMode: "any",
  location: "",
  industries: [],
};

export default function StartupJobFinder({ savedResume, initialHistory }) {
  const [resumeText, setResumeText] = useState("");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null);

  // ── Run AI search ──────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!resumeText.trim()) {
      toast.error("Please add your resume before searching.");
      return;
    }
    if (!profile.targetRole.trim()) {
      toast.error("Please enter a target role.");
      return;
    }

    setLoading(true);
    setResults(null);
    setSearchMeta(null);

    try {
      const jobProfile = {
        ...profile,
        techStack: profile.techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const data = await findStartups({ resumeText, jobProfile });
      setResults(data.results);
      setSearchMeta({ id: data.id, resultCount: data.resultCount });
      toast.success(`Found ${data.resultCount} matching startups!`);
    } catch (err) {
      toast.error(err.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Reload a past search from history ─────────────────────────────────────
  const handleReloadHistory = async (id) => {
    setLoading(true);
    setResults(null);
    try {
      const record = await getJobSearchById(id);
      const storedResults = Array.isArray(record.results)
        ? record.results
        : record.results?.results || [];

      // Re-populate the input form from the saved search
      setResumeText(record.resumeText || "");
      setProfile({
        targetRole: record.targetRole || "",
        techStack: (record.techStack || []).join(", "),
        experience: record.experience || "",
        workMode: record.workMode || "any",
        location: record.location || "",
        industries: record.industries || [],
      });
      setResults(storedResults);
      setSearchMeta({ id: record.id, resultCount: storedResults.length });
      toast.info("Loaded previous search");
    } catch (err) {
      toast.error(err.message || "Failed to load search");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resume */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Your Resume</CardTitle>
            <CardDescription>
              Paste your resume or auto-fill from your saved resume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResumeInput
              value={resumeText}
              onChange={setResumeText}
              savedResume={savedResume}
            />
          </CardContent>
        </Card>

        {/* Job profile */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Job Profile</CardTitle>
            <CardDescription>
              Describe the role and environment you're targeting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobProfileForm profile={profile} onChange={setProfile} />
          </CardContent>
          <CardFooter className="flex-col gap-3 pt-4 border-t">
            <Button
              id="find-startups-btn"
              className="w-full gap-2 h-11 text-base"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding startups…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Find Matching Startups
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              AI will match your profile to 10 real actively-hiring startups
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* History */}
      <SearchHistoryPanel
        history={initialHistory}
        onReload={handleReloadHistory}
      />

      <hr className="border-border" />

      {/* Results area */}
      {loading && <StartupSkeleton count={6} />}

      {!loading && results && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Matching Startups
              {searchMeta && (
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  ({searchMeta.resultCount} found)
                </span>
              )}
            </h2>
          </div>
          <StartupResultsGrid results={results} />
        </div>
      )}

      {!loading && results && results.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <p className="font-medium">No startups found for this profile.</p>
          <p className="text-sm mt-1">
            Try broadening your tech stack or removing location/industry filters.
          </p>
        </div>
      )}

      {!loading && !results && (
        <div className="rounded-lg border border-dashed py-20 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            Add your resume and job profile, then click{" "}
            <strong>Find Matching Startups</strong>
          </p>
        </div>
      )}
    </div>
  );
}
