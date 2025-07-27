import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { MetricCard } from "./MetricCard";
import { CashflowChart } from "./CashflowChart";
import { RecentDeals } from "./RecentDeals";
import { FixedCostsList } from "./FixedCostsList";
import { TimeFilter, TimePeriod } from "./TimeFilter";
import { AddFixedCostModal } from "./AddFixedCostModal";
import { AddDealModal } from "./AddDealModal";
import { MrrWidget } from "./MrrWidget";
import { useDashboardData } from "@/hooks/useDashboardData";
import { EnhancedCashflowChart } from "./EnhancedCashflowChart";
import { useAuth } from "@/hooks/useAuth";
import { Euro, TrendingUp, Clock, Briefcase, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "../ai/ChatInterface";

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

        {/* MRR Widget - moved to smaller position */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <MrrWidget />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="costs">Vaste Kosten</TabsTrigger>
            <TabsTrigger value="advisor">AI Adviseur</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Charts and Recent Data */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              <EnhancedCashflowChart 
                data={cashflowData} 
                timeframe={period === "day" ? "week" : period === "year" ? "quarter" : period}
                showRevenueBreakdown={true}
              />
              <RecentDeals 
                deals={data.deals.slice(0, 5)} 
                onDealsUpdate={handleDealsUpdate}
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nieuwe Deal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Voeg een nieuwe deal toe aan je pipeline
                  </p>
                  <AddDealModal onSuccess={handleDealsUpdate} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vaste Kosten</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Beheer je terugkerende uitgaven
                  </p>
                  <AddFixedCostModal onSuccess={handleFixedCostsUpdate} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cashflow Projectie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bekijk toekomstige cashflow trends
                  </p>
                  <Button variant="outline" className="w-full">
                    Projectie Bekijken
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deals">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Deal Management</h3>
                <AddDealModal onSuccess={handleDealsUpdate} />
              </div>
              <RecentDeals 
                deals={data.deals} 
                onDealsUpdate={handleDealsUpdate}
              />
            </div>
          </TabsContent>

          <TabsContent value="costs">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Vaste Kosten Overzicht</h3>
              </div>
              <FixedCostsList />
            </div>
          </TabsContent>

          <TabsContent value="advisor">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">AI Financieel Adviseur</h3>
              </div>
              <ChatInterface
                context={{
                  monthlyIncome: metrics.monthlyIncome,
                  monthlyExpenses: metrics.monthlyExpenses,
                  netCashflow: metrics.netCashflow,
                  pipelineValue: metrics.pendingValue,
                  activeDeals: data.deals.filter(deal => deal.status !== 'paid').length,
                  fixedCosts: data.fixedCosts.length
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};