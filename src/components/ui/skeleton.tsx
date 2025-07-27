import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Enhanced skeleton components for dashboard
function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-lg bg-card border", className)}>
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-3 w-20 mt-2" />
    </div>
  )
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-lg bg-card border", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-end h-64">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-8" style={{ height: `${Math.random() * 200 + 50}px` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DealListSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-lg bg-card border", className)}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-lg bg-card border", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-5 w-12" />
      </div>
      <div className="p-4 rounded-lg border-l-4 border-l-primary bg-primary/5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-48 mb-3" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  MetricCardSkeleton, 
  ChartSkeleton, 
  DealListSkeleton, 
  InsightsSkeleton 
}
