import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ModernChatInterface } from "@/components/ai/ModernChatInterface";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const AIAdvisorPage = () => {
  const { user, signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data, loading, metrics } = useDashboardData("month", currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">AI Advisor laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Simple top header */}
      <div className="flex-shrink-0 h-12 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4">
        <h1 className="text-sm font-medium text-foreground">AI Financieel Adviseur</h1>
        <button 
          onClick={signOut}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Uitloggen
        </button>
      </div>
      
      {/* Full screen chat interface */}
      <div className="flex-1 overflow-hidden">
        <ModernChatInterface
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
    </div>
  );
};