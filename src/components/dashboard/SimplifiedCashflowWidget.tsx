import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TimePeriod } from "@/components/dashboard/TimeFilter";
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

interface DashboardMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingValue: number;
  netCashflow: number;
  previousIncome: number;
  previousExpenses: number;
  previousPending: number;
  previousNetCashflow: number;
}

interface CashflowDataPoint {
  month: string;
  income: number;
  expenses: number;
  netCashflow: number;
}

interface SimplifiedCashflowWidgetProps {
  className?: string;
  period: TimePeriod;
  currentDate: Date;
  metrics: DashboardMetrics;
  cashflowData: CashflowDataPoint[];
}

export const SimplifiedCashflowWidget = ({ 
  className, 
  period, 
  currentDate, 
  metrics, 
  cashflowData 
}: SimplifiedCashflowWidgetProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground capitalize">
              {entry.dataKey === 'income' ? 'Inkomsten' : 
               entry.dataKey === 'expenses' ? 'Vaste Kosten' : 'Netto'}:
            </span>
            <span className="font-medium text-foreground ml-auto">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!cashflowData || cashflowData.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Cashflow Overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Geen cashflow data beschikbaar
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-lg border-0 bg-gradient-to-br from-card to-card/80", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            📊 Cashflow Overzicht
          </CardTitle>
          <Badge variant="outline" className="font-medium">
            Totaal: {formatCurrency(metrics.netCashflow)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="text-sm font-medium text-success/80 mb-1">Totale Inkomsten</div>
            <div className="text-2xl font-bold text-success">{formatCurrency(metrics.monthlyIncome)}</div>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="text-sm font-medium text-destructive/80 mb-1">Vaste Kosten</div>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(metrics.monthlyExpenses)}</div>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-sm font-medium text-primary/80 mb-1">Netto Resultaat</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.netCashflow)}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cashflowData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month"
                  className="text-sm"
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  className="text-sm"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
                
                {/* Income line - using the correct field name from useDashboardData */}
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--success))", strokeWidth: 2 }}
                  name="Inkomsten"
                />
                
                {/* Expenses line - using the correct field name from useDashboardData */}
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--destructive))", strokeWidth: 2 }}
                  name="Vaste Kosten"
                />
                
                {/* Net cashflow line - using the correct field name from useDashboardData */}
                <Line 
                  type="monotone" 
                  dataKey="netCashflow" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  name="Netto"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};