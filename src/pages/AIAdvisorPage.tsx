import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ModernChatInterface } from "@/components/ai/ModernChatInterface";
import { AIAdvisorStatistics } from "@/components/ai/AIAdvisorStatistics";
import { AIAdvisorLoadingSkeleton } from "@/components/ai/AIAdvisorLoadingSkeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";

export const AIAdvisorPage = () => {
  const { user, signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data, loading, metrics } = useDashboardData("month", currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AIAdvisorLoadingSkeleton />
        </main>
      </div>
    );
  }

  const financialContext = {
    monthlyIncome: metrics.monthlyIncome,
    monthlyExpenses: metrics.monthlyExpenses,
    netCashflow: metrics.netCashflow,
    pipelineValue: metrics.pendingValue,
    activeDeals: data.deals.filter(deal => deal.status !== 'paid').length,
    fixedCosts: data.fixedCosts.length
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
            <div className="absolute inset-0 bg-primary/10" />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold font-manrope mb-2">
                AI Financieel Adviseur
              </h1>
              <p className="text-primary-foreground/90 text-lg">
                Krijg gepersonaliseerd financieel advies op basis van je real-time data
              </p>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5" />
          </div>
        </div>

        {/* Statistics */}
        <AIAdvisorStatistics context={financialContext} />

        {/* Chat Interface */}
        <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <ModernChatInterface context={financialContext} />
          </div>
        </div>
      </main>
    </div>
  );
};