import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricChange {
  value: string;
  type: "positive" | "negative" | "neutral";
  period: string;
}

interface MetricProgress {
  current: number;
  target: number;
  label: string;
}

interface EnhancedMetricCardProps {
  title: string;
  value: string;
  icon: React.ReactElement<LucideIcon>;
  colorScheme: "revenue" | "expense" | "pending" | "neutral";
  change?: MetricChange;
  progress?: MetricProgress;
  trend?: "up" | "down" | "flat";
  className?: string;
  onClick?: () => void;
}

export const EnhancedMetricCard = ({
  title,
  value,
  icon,
  colorScheme,
  change,
  progress,
  trend,
  className,
  onClick
}: EnhancedMetricCardProps) => {
  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      default:
        return <Minus className="h-5 w-5 text-dashboard-neutral" />;
    }
  };

  const getValueColor = () => {
    switch (colorScheme) {
      case "revenue":
        return "text-success";
      case "expense":
        return "text-destructive";
      case "pending":
        return "text-warning";
      default:
        return "text-foreground";
    }
  };

  const getIconColor = () => {
    switch (colorScheme) {
      case "revenue":
        return "text-success bg-success/10";
      case "expense":
        return "text-destructive bg-destructive/10";
      case "pending":
        return "text-warning bg-warning/10";
      default:
        return "text-dashboard-neutral bg-muted";
    }
  };

  const getProgressColor = () => {
    switch (colorScheme) {
      case "revenue":
        return "bg-success";
      case "expense":
        return "bg-destructive";
      case "pending":
        return "bg-warning";
      default:
        return "bg-primary";
    }
  };

  const progressPercentage = progress ? Math.min((progress.current / progress.target) * 100, 100) : 0;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
        "bg-gradient-to-br from-card to-card/80 border-0 shadow-md",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl transition-colors", getIconColor())}>
            {icon}
          </div>
          {change && (
            <div className="flex items-center gap-1 text-sm font-medium">
              {getTrendIcon()}
              <span className={cn(
                change.type === "positive" ? "text-success" :
                change.type === "negative" ? "text-destructive" :
                "text-dashboard-neutral"
              )}>
                {change.value}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {title}
          </p>
          <p className={cn(
            "text-4xl font-bold font-manrope tracking-tight transition-colors",
            getValueColor()
          )}>
            {value}
          </p>
        </div>

        {change && (
          <p className="text-xs text-muted-foreground mt-2">
            {change.period}
          </p>
        )}

        {progress && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progress.label}</span>
              <span className="font-medium">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-muted"
              />
              <div 
                className={cn("absolute top-0 left-0 h-2 rounded-full transition-all duration-500", getProgressColor())}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </CardContent>
    </Card>
  );
};