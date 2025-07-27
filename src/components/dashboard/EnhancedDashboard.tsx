import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { MetricCard } from "./MetricCard";
import { TimeFilter, TimePeriod } from "./TimeFilter";
import { DashboardLoadingSkeleton } from "./DashboardLoadingSkeleton";
import { EmptyDashboardState } from "./EmptyDashboardState";
import { useDashboardData } from "@/hooks/useDashboardData";
import { SimplifiedCashflowWidget } from "./SimplifiedCashflowWidget";
import { useAuth } from "@/hooks/useAuth";
import { Euro, TrendingUp, Clock, Briefcase } from "lucide-react";

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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardLoadingSkeleton />
        </main>
      </div>
    );
  }

  // Check if we have any data to show
  const hasData = data.deals.length > 0 || data.fixedCosts.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold font-manrope mb-2">
                Cashflow Dashboard
              </h1>
              <p className="text-primary-foreground/90 text-lg">
                Real-time overzicht van je financiële situatie en cashflow projecties
              </p>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5" />
          </div>
        </div>

        {hasData ? (
          <>
            {/* Time Filter */}
            <div className="mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <TimeFilter
                period={period}
                onPeriodChange={setPeriod}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
            </div>

            {/* Metrics Grid - Enhanced with animations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
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
                  className="hover-scale transition-all duration-200 bg-gradient-to-r from-green-500/10 to-green-500/5 border-l-4 border-l-green-500/20 hover:border-l-green-500"
                />
              </div>
              
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
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
                  className="hover-scale transition-all duration-200 bg-gradient-to-r from-red-500/10 to-red-500/5 border-l-4 border-l-red-500/20 hover:border-l-red-500"
                />
              </div>
              
              <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
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
                  className={`hover-scale transition-all duration-200 bg-gradient-to-r ${
                    metrics.netCashflow >= 0 
                      ? "from-blue-500/10 to-blue-500/5 border-l-4 border-l-blue-500/20 hover:border-l-blue-500" 
                      : "from-orange-500/10 to-orange-500/5 border-l-4 border-l-orange-500/20 hover:border-l-orange-500"
                  }`}
                />
              </div>
              
              <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
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
                  className="hover-scale transition-all duration-200 bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-l-4 border-l-purple-500/20 hover:border-l-purple-500"
                />
              </div>
            </div>

            {/* Simplified Cashflow - Full Width */}
            <div className="mb-8 animate-fade-in" style={{ animationDelay: "350ms" }}>
              <SimplifiedCashflowWidget 
                period={period}
                currentDate={currentDate}
                metrics={metrics}
                cashflowData={cashflowData}
              />
            </div>
          </>
        ) : (
          <EmptyDashboardState 
            onDealsUpdate={handleDealsUpdate}
            onFixedCostsUpdate={handleFixedCostsUpdate}
          />
        )}
      </main>
    </div>
  );
};