import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBox({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 ${className}`}
    />
  );
}

function StartupCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <SkeletonBox className="h-5 w-36" />
            <SkeletonBox className="h-3.5 w-full" />
          </div>
          <SkeletonBox className="h-8 w-16 rounded-full shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Badges row */}
        <div className="flex gap-2">
          <SkeletonBox className="h-5 w-20 rounded-full" />
          <SkeletonBox className="h-5 w-16 rounded-full" />
          <SkeletonBox className="h-5 w-12 rounded-full" />
        </div>
        {/* Tech stack */}
        <div className="flex gap-1.5 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-14 rounded" />
          ))}
        </div>
        {/* Match reason */}
        <div className="space-y-1.5">
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-4/5" />
        </div>
        {/* Open roles */}
        <SkeletonBox className="h-3.5 w-32" />
        {/* Links */}
        <div className="flex gap-2 pt-1">
          <SkeletonBox className="h-7 w-20 rounded-md" />
          <SkeletonBox className="h-7 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function StartupSkeleton({ count = 8 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <StartupCardSkeleton key={i} />
      ))}
    </div>
  );
}
