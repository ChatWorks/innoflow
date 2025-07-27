import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    type: "positive" | "negative" | "neutral";
    period: string;
  };
  trend?: "up" | "down" | "stable";
  className?: string;
  icon?: React.ReactNode;
  colorScheme?: "revenue" | "expense" | "pending" | "neutral";
}

export const MetricCard = ({
  title,
  value,
  change,
  trend,
  className,
  icon,
  colorScheme = "neutral"
}: MetricCardProps) => {
  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case "positive":
        return <ArrowUpIcon className="w-4 h-4 text-success" />;
      case "negative":
        return <ArrowDownIcon className="w-4 h-4 text-destructive" />;
      default:
        return <TrendingUpIcon className="w-4 h-4 text-dashboard-neutral" />;
    }
  };

  const getValueColor = () => {
    switch (colorScheme) {
      case "revenue":
        return "text-dashboard-revenue";
      case "expense":
        return "text-dashboard-expense";
      case "pending":
        return "text-dashboard-pending";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card className={cn("metric-card hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="w-5 h-5 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold mt-1">
            {value}
          </div>
          {change && (
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon()}
              <span className={cn(
                "font-medium",
                change.type === "positive" && "metric-change-positive",
                change.type === "negative" && "metric-change-negative",
                change.type === "neutral" && "text-dashboard-neutral"
              )}>
                {change.value}
              </span>
              <span className="text-muted-foreground">{change.period}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};