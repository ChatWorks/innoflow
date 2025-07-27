import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { MetricCard } from "./MetricCard";
import { TimeFilter, TimePeriod } from "./TimeFilter";
import { useDashboardData } from "@/hooks/useDashboardData";
import { SimplifiedCashflowWidget } from "./SimplifiedCashflowWidget";
import { useAuth } from "@/hooks/useAuth";
import { Euro, TrendingUp, Clock, Briefcase, Loader2 } from "lucide-react";

export const EnhancedDashboard = () => {
  const { user, signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState<TimePeriod>("month");
  
  const { data, loading, metrics, cashflowData, refetch } = useDashboardData(period, currentDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getChangeType = (current: number, previous: number): "positive" | "negative" | "neutral" => {
    if (current > previous) return "positive";
    if (current < previous) return "negative";
    return "neutral";
  };

  const handleDealsUpdate = () => {
    refetch();
  };

  const handleFixedCostsUpdate = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Dashboard laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-manrope text-foreground mb-2">
            Cashflow Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time overzicht van je financiële situatie en cashflow projecties
          </p>
        </div>

        {/* Time Filter */}
        <div className="mb-8">
          <TimeFilter
            period={period}
            onPeriodChange={setPeriod}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </div>

        {/* Metrics Grid - Enhanced with larger values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Inkomsten Deze Periode"
            value={formatCurrency(metrics.monthlyIncome)}
            icon={<Euro />}
            colorScheme="revenue"
            change={{
              value: calculateChange(metrics.monthlyIncome, metrics.previousIncome),
              type: getChangeType(metrics.monthlyIncome, metrics.previousIncome),
              period: "vs vorige periode"
            }}
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard
            title="Uitgaven Deze Periode"
            value={formatCurrency(metrics.monthlyExpenses)}
            icon={<TrendingUp />}
            colorScheme="expense"
            change={{
              value: calculateChange(metrics.monthlyExpenses, metrics.previousExpenses),
              type: getChangeType(metrics.previousExpenses, metrics.monthlyExpenses),
              period: "vs vorige periode"
            }}
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard
            title="Netto Cashflow"
            value={formatCurrency(metrics.netCashflow)}
            icon={<Briefcase />}
            colorScheme={metrics.netCashflow >= 0 ? "revenue" : "expense"}
            change={{
              value: calculateChange(metrics.netCashflow, metrics.previousNetCashflow),
              type: getChangeType(metrics.netCashflow, metrics.previousNetCashflow),
              period: "vs vorige periode"
            }}
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard
            title="Pipeline Waarde"
            value={formatCurrency(metrics.pendingValue)}
            icon={<Clock />}
            colorScheme="pending"
            change={{
              value: calculateChange(metrics.pendingValue, metrics.previousPending),
              type: getChangeType(metrics.pendingValue, metrics.previousPending),
              period: "vs vorige periode"
            }}
            className="hover:scale-105 transition-transform duration-200"
          />
        </div>


        {/* Simplified Cashflow - Full Width */}
        <div className="mb-8">
          <SimplifiedCashflowWidget />
        </div>
      </main>
    </div>
  );
};