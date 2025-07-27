import { useState, useEffect } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { EnhancedMetricCard } from "./EnhancedMetricCard";
import { EnhancedCashflowChart } from "./EnhancedCashflowChart";
import { QuickInsightsWidget } from "./QuickInsightsWidget";
import { EnhancedFilterBar, DateRange, FilterPreset } from "./EnhancedFilterBar";
import { FloatingActionButton } from "./FloatingActionButton";
import { RecentDeals } from "./RecentDeals";
import { FixedCostsList } from "./FixedCostsList";
import { useEnhancedDashboardData } from "@/hooks/useEnhancedDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { 
  Euro, 
  TrendingUp, 
  Clock, 
  Briefcase, 
  Target,
  PiggyBank,
  Download,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "../ai/ChatInterface";
import { MetricCardSkeleton, ChartSkeleton, DealListSkeleton, InsightsSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { startOfMonth, endOfMonth } from "date-fns";

export const EnhancedDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Enhanced state management
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [filterPreset, setFilterPreset] = useState<FilterPreset>("this-month");
  
  const { data, loading, metrics, cashflowData, refetch } = useEnhancedDashboardData(dateRange);

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

  const handleExport = () => {
    toast({
      title: "Export gestart",
      description: "Je data wordt voorbereid voor download.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-fade-in-scale">
        <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
          <InsightsSkeleton />
          <ChartSkeleton />
          <DealListSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="animate-fade-in-scale">
          <h1 className="text-4xl font-bold font-manrope text-foreground mb-2">
            Cashflow Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Professioneel overzicht van je financiële situatie en voorspellingen
          </p>
        </div>

        {/* Enhanced Filter Bar */}
        <EnhancedFilterBar
          currentRange={dateRange}
          onRangeChange={setDateRange}
          currentPreset={filterPreset}
          onPresetChange={setFilterPreset}
        />

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-scale">
          <EnhancedMetricCard
            title="Inkomsten Deze Periode"
            value={formatCurrency(metrics.currentIncome)}
            icon={<Euro className="h-5 w-5" />}
            colorScheme="revenue"
            change={{
              value: calculateChange(metrics.currentIncome, metrics.previousIncome),
              type: getChangeType(metrics.currentIncome, metrics.previousIncome),
              period: "vs vorige periode"
            }}
            progress={{
              current: metrics.currentIncome,
              target: 50000,
              label: "Maandtarget"
            }}
          />
          <EnhancedMetricCard
            title="Uitgaven Deze Periode"
            value={formatCurrency(metrics.currentExpenses)}
            icon={<TrendingUp className="h-5 w-5" />}
            colorScheme="expense"
            change={{
              value: calculateChange(metrics.currentExpenses, metrics.previousExpenses),
              type: getChangeType(metrics.previousExpenses, metrics.currentExpenses),
              period: "vs vorige periode"
            }}
          />
          <EnhancedMetricCard
            title="Netto Cashflow"
            value={formatCurrency(metrics.netCashflow)}
            icon={<Briefcase className="h-5 w-5" />}
            colorScheme={metrics.netCashflow >= 0 ? "revenue" : "expense"}
            change={{
              value: calculateChange(metrics.netCashflow, metrics.previousNetCashflow),
              type: getChangeType(metrics.netCashflow, metrics.previousNetCashflow),
              period: "vs vorige periode"
            }}
          />
          <EnhancedMetricCard
            title="Pipeline Waarde"
            value={formatCurrency(metrics.pipelineValue)}
            icon={<Clock className="h-5 w-5" />}
            colorScheme="pending"
            change={{
              value: calculateChange(metrics.pipelineValue, metrics.previousPending),
              type: getChangeType(metrics.pipelineValue, metrics.previousPending),
              period: "vs vorige periode"
            }}
          />
        </div>

        {/* Quick Insights Widget */}
        <QuickInsightsWidget
          monthlyIncome={metrics.currentIncome}
          monthlyExpenses={metrics.currentExpenses}
          netCashflow={metrics.netCashflow}
          pipelineValue={metrics.pipelineValue}
          deals={data.deals}
          fixedCosts={data.fixedCosts}
        />

        {/* Enhanced Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="costs">Vaste Kosten</TabsTrigger>
            <TabsTrigger value="advisor">AI Adviseur</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <EnhancedCashflowChart 
                data={cashflowData} 
                className="lg:col-span-3"
                showForecast={true}
              />
              <RecentDeals 
                deals={data.deals.slice(0, 5)} 
                onDealsUpdate={refetch}
                className="lg:col-span-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="deals">
            <RecentDeals 
              deals={data.deals} 
              onDealsUpdate={refetch}
            />
          </TabsContent>

          <TabsContent value="costs">
            <FixedCostsList />
          </TabsContent>

          <TabsContent value="advisor">
            <ChatInterface
              context={{
                monthlyIncome: metrics.currentIncome,
                monthlyExpenses: metrics.currentExpenses,
                netCashflow: metrics.netCashflow,
                pipelineValue: metrics.pipelineValue,
                activeDeals: data.deals.filter(deal => deal.status !== 'paid').length,
                fixedCosts: data.fixedCosts.length
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        onRefresh={refetch}
        onExport={handleExport}
        onQuickDeal={refetch}
      />
    </div>
  );
};