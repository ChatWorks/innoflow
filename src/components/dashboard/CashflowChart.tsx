import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CashflowDataPoint {
  month: string;
  income: number;
  expenses: number;
  netCashflow: number;
}

interface CashflowChartProps {
  data: CashflowDataPoint[];
  timeframe?: "week" | "month" | "quarter" | "year";
}

export const CashflowChart = ({ data, timeframe = "month" }: CashflowChartProps) => {
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
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cashflow Overzicht</span>
          <span className="text-sm font-normal text-muted-foreground capitalize">
            Per {timeframe === "week" ? "week" : timeframe === "month" ? "maand" : timeframe === "quarter" ? "kwartaal" : "jaar"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="month" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '14px'
                }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--dashboard-revenue))"
                strokeWidth={3}
                name="Inkomsten"
                dot={{ fill: "hsl(var(--dashboard-revenue))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--dashboard-revenue))" }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--dashboard-expense))"
                strokeWidth={3}
                name="Uitgaven"
                dot={{ fill: "hsl(var(--dashboard-expense))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--dashboard-expense))" }}
              />
              <Line
                type="monotone"
                dataKey="netCashflow"
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                name="Netto Cashflow"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};