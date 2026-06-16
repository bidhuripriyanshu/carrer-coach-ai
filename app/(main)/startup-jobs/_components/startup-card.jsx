"use client";

import { ExternalLink, Globe, Linkedin, Users, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTier } from "@/data/team-size-tiers";
import { cn } from "@/lib/utils";

function MatchScoreBadge({ score }) {
  const color =
    score >= 85
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      : score >= 70
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shrink-0",
        color
      )}
    >
      <Zap className="h-3 w-3" />
      {score}%
    </span>
  );
}

export default function StartupCard({ startup }) {
  const {
    name,
    tagline,
    website,
    linkedinUrl,
    jobsUrl,
    teamSize,
    fundingStage,
    techStack,
    openRoles,
    matchScore,
    matchReason,
    location,
    industry,
    founded,
    remote,
  } = startup;

  const tier = getTier(teamSize);

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            {tagline && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {tagline}
              </p>
            )}
          </div>
          <MatchScoreBadge score={matchScore} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {/* Badges: team size, funding, location */}
        <div className="flex flex-wrap gap-1.5">
          {tier && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                tier.bgClass,
                tier.textClass,
                tier.borderClass
              )}
            >
              <Users className="h-3 w-3" />
              {teamSize ? `${teamSize} people` : tier.label}
            </span>
          )}
          {fundingStage && fundingStage !== "Unknown" && (
            <Badge variant="secondary" className="text-xs">
              {fundingStage}
            </Badge>
          )}
          {remote && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-400">
              Remote ✓
            </Badge>
          )}
          {location && !remote && (
            <Badge variant="outline" className="text-xs">
              {location}
            </Badge>
          )}
          {industry && (
            <Badge variant="outline" className="text-xs">
              {industry}
            </Badge>
          )}
        </div>

        {/* Tech stack */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {techStack.slice(0, 6).map((tech) => (
              <span
                key={tech}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {techStack.length > 6 && (
              <span className="text-[10px] text-muted-foreground">
                +{techStack.length - 6} more
              </span>
            )}
          </div>
        )}

        {/* AI match reason */}
        {matchReason && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {matchReason}
          </p>
        )}

        {/* Open roles */}
        {openRoles.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Open roles
            </p>
            <div className="flex flex-wrap gap-1">
              {openRoles.slice(0, 3).map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] text-primary"
                >
                  {role}
                </span>
              ))}
              {openRoles.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{openRoles.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer: meta + links */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t">
          {founded && (
            <p className="text-[10px] text-muted-foreground">
              Est. {founded}
            </p>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                <Globe className="h-3 w-3" />
                Website
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-muted-foreground hover:text-blue-600 hover:border-blue-400 transition-colors"
              >
                <Linkedin className="h-3 w-3" />
                LinkedIn
              </a>
            )}
            {jobsUrl && (
              <a
                href={jobsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/5 px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Apply
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
