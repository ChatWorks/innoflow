import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardLoadingSkeletonProps {
  withHero?: boolean;
}

export const DashboardLoadingSkeleton = ({ withHero = true }: DashboardLoadingSkeletonProps) => {
  return (
    <div className="space-y-8">
      {/* Hero section skeleton */}
      {withHero && (
        <div className="relative overflow-hidden rounded-2xl h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-8">
          <div className="space-y-3">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
      )}

      {/* Time filter skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="h-80 bg-muted/20 rounded-lg flex items-end justify-around p-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-8 animate-pulse"
                  style={{
                    height: `${Math.random() * 200 + 50}px`,
                    animationDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};