import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from "recharts";
import { TrendingUp, ZoomIn, ZoomOut, BarChart3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface CashflowDataPoint {
  month: string;
  income: number;
  expenses: number;
  netCashflow: number;
  forecastIncome?: number;
  forecastExpenses?: number;
  forecastNetCashflow?: number;
}

interface EnhancedCashflowChartProps {
  data: CashflowDataPoint[];
  timeframe?: "week" | "month" | "quarter";
  className?: string;
  showForecast?: boolean;
  onDataPointClick?: (data: any) => void;
}

export const EnhancedCashflowChart = ({
  data,
  timeframe = "month",
  className,
  showForecast = true,
  onDataPointClick
}: EnhancedCashflowChartProps) => {
  const [zoomLevel, setZoomLevel] = useState<"all" | "recent" | "forecast">("all");
  const [hoveredData, setHoveredData] = useState<any>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-semibold text-card-foreground mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name === 'income' ? 'Inkomsten' :
                     entry.name === 'expenses' ? 'Uitgaven' :
                     entry.name === 'netCashflow' ? 'Netto Cashflow' :
                     entry.name === 'forecastIncome' ? 'Verwachte Inkomsten' :
                     entry.name === 'forecastExpenses' ? 'Verwachte Uitgaven' :
                     'Verwachte Netto Cashflow'}
                  </span>
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  entry.name.includes('expenses') ? "text-destructive" :
                  entry.name.includes('income') ? "text-success" :
                  entry.value >= 0 ? "text-success" : "text-destructive"
                )}>
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomCursor = ({ active, payload, coordinate }: any) => {
    if (active && coordinate) {
      return (
        <line
          x1={coordinate.x}
          y1={0}
          x2={coordinate.x}
          y2="100%"
          stroke="hsl(var(--primary))"
          strokeWidth={1}
          strokeDasharray="5,5"
          opacity={0.6}
        />
      );
    }
    return null;
  };

  const handleDataPointClick = (data: any) => {
    if (onDataPointClick) {
      onDataPointClick(data);
    }
  };

  const getZoomedData = () => {
    switch (zoomLevel) {
      case "recent":
        return data.slice(-6); // Last 6 periods
      case "forecast":
        return data.slice(-3); // Last 3 periods + forecast
      default:
        return data;
    }
  };

  const zoomedData = getZoomedData();
  const latestData = data[data.length - 1];
  const trend = latestData?.netCashflow >= 0 ? "positive" : "negative";

  return (
    <Card className={cn("col-span-1 lg:col-span-3", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cashflow Overzicht
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={trend === "positive" ? "default" : "destructive"}
                className="text-xs"
              >
                <Activity className="h-3 w-3 mr-1" />
                {trend === "positive" ? "Positieve trend" : "Negatieve trend"}
              </Badge>
              {latestData && (
                <span className="text-sm text-muted-foreground">
                  Laatste: {formatCurrency(latestData.netCashflow)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={zoomLevel === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setZoomLevel("all")}
              className="text-xs"
            >
              Alles
            </Button>
            <Button
              variant={zoomLevel === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setZoomLevel("recent")}
              className="text-xs"
            >
              Recent
            </Button>
            <Button
              variant={zoomLevel === "forecast" ? "default" : "outline"}
              size="sm"
              onClick={() => setZoomLevel("forecast")}
              className="text-xs"
            >
              Voorspelling
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={zoomedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onMouseMove={(data) => setHoveredData(data)}
              onMouseLeave={() => setHoveredData(null)}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis 
                dataKey="month" 
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
              <Tooltip 
                content={<CustomTooltip />}
                cursor={<CustomCursor />}
              />
              <Legend 
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
              />
              
              {/* Zero line reference */}
              <ReferenceLine 
                y={0} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="2 2"
                opacity={0.5}
              />
              
              {/* Actual data lines */}
              <Line
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--success))"
                strokeWidth={3}
                dot={{ 
                  fill: "hsl(var(--success))", 
                  strokeWidth: 2, 
                  r: 5,
                  cursor: "pointer"
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: "hsl(var(--success))",
                  strokeWidth: 2,
                  onClick: handleDataPointClick
                }}
                name="Inkomsten"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--destructive))"
                strokeWidth={3}
                dot={{ 
                  fill: "hsl(var(--destructive))", 
                  strokeWidth: 2, 
                  r: 5,
                  cursor: "pointer"
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: "hsl(var(--destructive))",
                  strokeWidth: 2,
                  onClick: handleDataPointClick
                }}
                name="Uitgaven"
              />
              <Line
                type="monotone"
                dataKey="netCashflow"
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                dot={{ 
                  fill: "hsl(var(--primary))", 
                  strokeWidth: 2, 
                  r: 6,
                  cursor: "pointer"
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 3,
                  onClick: handleDataPointClick
                }}
                name="Netto Cashflow"
              />
              
              {/* Forecast lines (dotted) */}
              {showForecast && (
                <>
                  <Line
                    type="monotone"
                    dataKey="forecastIncome"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{ 
                      fill: "hsl(var(--success))", 
                      strokeWidth: 1, 
                      r: 4,
                      opacity: 0.7
                    }}
                    name="Verwachte Inkomsten"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastExpenses"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{ 
                      fill: "hsl(var(--destructive))", 
                      strokeWidth: 1, 
                      r: 4,
                      opacity: 0.7
                    }}
                    name="Verwachte Uitgaven"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastNetCashflow"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={{ 
                      fill: "hsl(var(--primary))", 
                      strokeWidth: 1, 
                      r: 5,
                      opacity: 0.7
                    }}
                    name="Verwachte Netto Cashflow"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {hoveredData && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Klik op een datapunt voor meer details over die periode
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};