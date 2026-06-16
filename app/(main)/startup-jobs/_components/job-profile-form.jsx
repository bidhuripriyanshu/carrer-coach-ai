"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPERIENCE_LEVELS = [
  { value: "fresher", label: "Fresher (0–1 yr)" },
  { value: "junior", label: "Junior (1–3 yrs)" },
  { value: "mid", label: "Mid-level (3–5 yrs)" },
  { value: "senior", label: "Senior (5–8 yrs)" },
  { value: "lead", label: "Lead / Staff (8+ yrs)" },
];

const WORK_MODES = [
  { value: "any", label: "Any" },
  { value: "remote", label: "Remote only" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const INDUSTRY_OPTIONS = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "SaaS / B2B",
  "E-commerce",
  "AI / ML",
  "DevTools",
  "CleanTech",
  "LegalTech",
  "HRTech",
  "Gaming",
  "Web3 / Crypto",
  "Media / Content",
  "Logistics",
  "AgriTech",
];

export default function JobProfileForm({ profile, onChange }) {
  const set = (key, value) => onChange({ ...profile, [key]: value });

  const toggleIndustry = (ind) => {
    const list = profile.industries || [];
    set(
      "industries",
      list.includes(ind) ? list.filter((i) => i !== ind) : [...list, ind]
    );
  };

  return (
    <div className="space-y-4">
      {/* Target Role */}
      <div className="space-y-1.5">
        <Label htmlFor="targetRole">
          Target Role <span className="text-destructive">*</span>
        </Label>
        <Input
          id="targetRole"
          placeholder="e.g. Full-Stack Engineer, Product Designer"
          value={profile.targetRole}
          onChange={(e) => set("targetRole", e.target.value)}
        />
      </div>

      {/* Tech Stack */}
      <div className="space-y-1.5">
        <Label htmlFor="techStack">
          Tech Stack <span className="text-destructive">*</span>
        </Label>
        <Input
          id="techStack"
          placeholder="e.g. React, Node.js, PostgreSQL, TypeScript"
          value={profile.techStack}
          onChange={(e) => set("techStack", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Separate with commas. The more specific, the better the matches.
        </p>
      </div>

      {/* Experience + Work Mode */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Experience Level</Label>
          <Select
            value={profile.experience}
            onValueChange={(v) => set("experience", v)}
          >
            <SelectTrigger id="experience">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Work Mode</Label>
          <Select
            value={profile.workMode}
            onValueChange={(v) => set("workMode", v)}
          >
            <SelectTrigger id="workMode">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {WORK_MODES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label htmlFor="location">Location Preference</Label>
        <Input
          id="location"
          placeholder="e.g. Bangalore, Mumbai, Remote, US East Coast"
          value={profile.location}
          onChange={(e) => set("location", e.target.value)}
        />
      </div>

      {/* Industries */}
      <div className="space-y-1.5">
        <Label>Preferred Industries</Label>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_OPTIONS.map((ind) => {
            const active = (profile.industries || []).includes(ind);
            return (
              <button
                key={ind}
                type="button"
                onClick={() => toggleIndustry(ind)}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {ind}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {(profile.industries || []).length === 0
            ? "Leave empty to search across all industries."
            : `${(profile.industries || []).length} selected`}
        </p>
      </div>
    </div>
  );
}
