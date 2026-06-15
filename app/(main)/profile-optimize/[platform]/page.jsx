import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatform } from "@/data/optimization-platforms";
import { getProfileOptimizationHistory } from "@/actions/profile-optimize";
import PlatformOptimizer from "../_components/platform-optimizer";

export default async function PlatformOptimizePage({ params }) {
  const { platform: platformId } = await params;
  const platform = getPlatform(platformId);

  if (!platform) notFound();

  let history = [];
  try {
    history = await getProfileOptimizationHistory(platformId);
  } catch {
    history = [];
  }

  return (
    <div className="space-y-6 pb-12">
      <Link href="/profile-optimize">
        <Button variant="link" className="gap-2 pl-0">
          <ArrowLeft className="h-4 w-4" />
          All platforms
        </Button>
      </Link>

      <header>
        <h1 className="text-4xl font-bold gradient-title md:text-5xl">
          {platform.name} Optimization
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{platform.tagline}</p>
      </header>

      <PlatformOptimizer platform={platform} initialHistory={history} />
    </div>
  );
}
