import Link from "next/link";
import { getProfileOptimizationHistory } from "@/actions/profile-optimize";
import { PLATFORM_LIST } from "@/data/optimization-platforms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Github, Globe, Linkedin, Sparkles } from "lucide-react";

const ICONS = {
  linkedin: Linkedin,
  github: Github,
  portfolio: Globe,
};

export default async function ProfileOptimizePage() {
  let history = [];
  try {
    history = await getProfileOptimizationHistory();
  } catch {
    history = [];
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-3 border-b pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider">
            Optimize
          </Badge>
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight gradient-title md:text-6xl">
          Profile Optimization
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Enter your LinkedIn or GitHub username, or paste deployed project links.
          We fetch your profile data automatically and AI optimizes it with scores and suggestions.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {PLATFORM_LIST.map((platform) => {
          const Icon = ICONS[platform.id] || Globe;
          const recent = history.find((h) => h.platform === platform.id);

          return (
            <Card
              key={platform.id}
              className={`bg-gradient-to-br ${platform.color} hover:border-primary/40 transition-colors`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Icon className="h-5 w-5" />
                  {platform.name}
                </CardTitle>
                <CardDescription>{platform.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{platform.description}</p>
                {recent && (
                  <p className="text-xs text-muted-foreground">
                    Last score: <strong>{Math.round(recent.overallScore)}/100</strong>
                  </p>
                )}
                <Link href={`/profile-optimize/${platform.id}`}>
                  <Button className="w-full gap-2">
                    Optimize {platform.name}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent optimizations</CardTitle>
            <CardDescription>Your latest reports across all platforms</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 6).map((item) => {
              const platform = PLATFORM_LIST.find((p) => p.id === item.platform);
              return (
                <Link
                  key={item.id}
                  href={`/profile-optimize/${item.platform}`}
                  className="rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                >
                  <p className="font-medium text-sm">
                    {item.profileLabel || platform?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score {Math.round(item.overallScore)}/100
                  </p>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
