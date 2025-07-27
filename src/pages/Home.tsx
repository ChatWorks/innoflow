import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SimplifiedCashflowWidget } from "@/components/dashboard/SimplifiedCashflowWidget";
import { QuickInsightsWidget } from "@/components/dashboard/QuickInsightsWidget";
import { TimeRangeSelector, TimePeriodType } from "@/components/dashboard/TimeRangeSelector";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Euro, Calendar, Activity } from "lucide-react";
import { useState } from "react";

export const Home = () => {
  const { user, signOut } = useAuth();
  const [period, setPeriod] = useState<TimePeriodType>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const { data, loading, metrics } = useDashboardData(period, currentDate);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onLogout={signOut} 
        userName={user?.email?.split('@')[0] || 'Team Member'} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welkom terug, {user?.email?.split('@')[0] || 'Team Member'}
                </h1>
                <p className="text-muted-foreground">
                  Hier is je cashflow overzicht en belangrijkste inzichten
                </p>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <TimeRangeSelector
              period={period}
              onPeriodChange={setPeriod}
              selectedDate={currentDate}
              onDateChange={setCurrentDate}
              className="min-w-[300px]"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Cashflow Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {loading ? "..." : metrics?.netCashflow >= 0 ? "Positief" : "Negatief"}
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                {loading ? "..." : `${formatCurrency(metrics?.netCashflow || 0)} netto`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inkomsten</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(metrics?.monthlyIncome || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {period === 'day' ? 'Vandaag' : period === 'month' ? 'Deze maand' : period === 'quarter' ? 'Dit kwartaal' : 'Dit jaar'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uitgaven</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(metrics?.monthlyExpenses || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Vaste kosten</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(metrics?.pendingValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Potential deals</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cashflow Widget - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SimplifiedCashflowWidget />
          </div>

          {/* Quick Insights - Takes 1 column */}
          <div className="lg:col-span-1">
            <QuickInsightsWidget 
              monthlyIncome={metrics?.monthlyIncome || 0}
              monthlyExpenses={metrics?.monthlyExpenses || 0}
              netCashflow={metrics?.netCashflow || 0}
              pipelineValue={metrics?.pendingValue || 0}
              deals={data?.deals || []}
              fixedCosts={data?.fixedCosts || []}
            />
          </div>
        </div>

        {/* Bottom Section - Additional insights or tips */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">💡 Dashboard Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800 dark:text-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Cashflow Monitoring:</strong> Bekijk je cashflow trends om toekomstige liquiditeit te voorspellen.
                </div>
                <div>
                  <strong>Periodevergelijking:</strong> Wissel tussen dag, maand, kwartaal en jaar weergaves voor verschillende inzichten.
                </div>
                <div>
                  <strong>AI Advisor:</strong> Gebruik de AI advisor voor gepersonaliseerde business inzichten en aanbevelingen.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Home;