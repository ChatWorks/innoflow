import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TimeRangeSelector, TimePeriodType } from "./TimeRangeSelector";
import { useEnhancedCashflowData } from "@/hooks/useEnhancedCashflowData";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimplifiedCashflowWidgetProps {
  className?: string;
}

export const SimplifiedCashflowWidget = ({ className }: SimplifiedCashflowWidgetProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodType, setPeriodType] = useState<TimePeriodType>("month");
  const { data, loading, summary } = useEnhancedCashflowData(periodType, selectedDate);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatAxisLabel = (value: string, data?: any) => {
    if (data && data.period) {
      return data.period;
    }
    
    // Fallback formatting based on period type
    const date = new Date(value);
    switch (periodType) {
      case "day":
        return date.getDate().toString();
      case "month":
        return date.toLocaleDateString('nl-NL', { month: 'short' });
      case "quarter":
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter}`;
      case "year":
        return date.getFullYear().toString();
      default:
        return date.getDate().toString();
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-card-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-success">Inkomsten:</span>
              <span className="font-medium">{formatCurrency(data.deals)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-destructive">Vaste Kosten:</span>
              <span className="font-medium">{formatCurrency(data.fixedCosts)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t pt-1">
              <span className="text-foreground">Netto:</span>
              <span className={cn("font-medium", data.total >= 0 ? "text-success" : "text-destructive")}>
                {formatCurrency(data.total)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={cn("col-span-1 lg:col-span-2", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dagelijkse Cashflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="h-6 w-6 animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Laden...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("col-span-1 lg:col-span-2", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cashflow Overzicht
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={summary.totalNet >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {summary.totalNet >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {summary.totalNet >= 0 ? "Positief" : "Negatief"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Totaal: {formatCurrency(summary.totalNet)}
              </span>
            </div>
          </div>
          
          <TimeRangeSelector
            period={periodType}
            onPeriodChange={setPeriodType}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Totale Inkomsten</p>
            <p className="text-lg font-semibold text-success">{formatCurrency(summary.totalDeals)}</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Vaste Kosten</p>
            <p className="text-lg font-semibold text-destructive">{formatCurrency(summary.totalFixedCosts)}</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Netto Resultaat</p>
            <p className={cn("text-lg font-semibold", summary.totalNet >= 0 ? "text-success" : "text-destructive")}>
              {formatCurrency(summary.totalNet)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis 
                dataKey="period"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine 
                y={0} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="2 2"
                opacity={0.5}
              />
              
              <Line
                type="monotone"
                dataKey="deals"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--success))", strokeWidth: 1, r: 3 }}
                name="Inkomsten"
              />
              <Line
                type="monotone"
                dataKey="fixedCosts"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))", strokeWidth: 1, r: 3 }}
                name="Vaste Kosten"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                name="Netto"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};