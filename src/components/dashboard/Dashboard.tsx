import { useState, useEffect } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { MetricCard } from "./MetricCard";
import { CashflowChart } from "./CashflowChart";
import { RecentDeals } from "./RecentDeals";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Euro, TrendingUp, Clock, Briefcase } from "lucide-react";

interface DashboardData {
  deals: any[];
  fixedCosts: any[];
  cashflowEntries: any[];
}

// Mock data for demonstration
const mockCashflowData = [
  { month: "Jan", income: 45000, expenses: 32000, netCashflow: 13000 },
  { month: "Feb", income: 52000, expenses: 35000, netCashflow: 17000 },
  { month: "Mar", income: 48000, expenses: 33000, netCashflow: 15000 },
  { month: "Apr", income: 55000, expenses: 38000, netCashflow: 17000 },
  { month: "Mei", income: 61000, expenses: 41000, netCashflow: 20000 },
  { month: "Jun", income: 58000, expenses: 39000, netCashflow: 19000 },
];

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({
    deals: [],
    fixedCosts: [],
    cashflowEntries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch deals
      const { data: deals, error: dealsError } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (dealsError) {
        console.error("Error fetching deals:", dealsError);
        toast({
          title: "Error loading deals",
          description: "Could not load recent deals",
          variant: "destructive",
        });
      }

      // Fetch fixed costs
      const { data: fixedCosts, error: costsError } = await supabase
        .from("fixed_costs")
        .select("*")
        .eq("is_active", true);

      if (costsError) {
        console.error("Error fetching fixed costs:", costsError);
      }

      // Fetch cashflow entries
      const { data: cashflowEntries, error: entriesError } = await supabase
        .from("cashflow_entries")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (entriesError) {
        console.error("Error fetching cashflow entries:", entriesError);
      }

      setData({
        deals: deals || [],
        fixedCosts: fixedCosts || [],
        cashflowEntries: cashflowEntries || []
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error loading dashboard",
        description: "Could not load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate total income this month
    const monthlyIncome = data.cashflowEntries
      .filter(entry => {
        const entryDate = new Date(entry.transaction_date);
        return entry.type === "income" && 
               entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    // Calculate total expenses this month
    const monthlyExpenses = data.cashflowEntries
      .filter(entry => {
        const entryDate = new Date(entry.transaction_date);
        return entry.type === "expense" && 
               entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    // Calculate pending deals value
    const pendingValue = data.deals
      .filter(deal => deal.status === "potential" || deal.status === "confirmed")
      .reduce((sum, deal) => sum + Number(deal.amount), 0);

    // Calculate net cashflow
    const netCashflow = monthlyIncome - monthlyExpenses;

    return {
      monthlyIncome,
      monthlyExpenses,
      pendingValue,
      netCashflow
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-primary/20 rounded-lg mx-auto mb-4"></div>
                <p className="text-muted-foreground">Dashboard laden...</p>
              </div>
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Inkomsten Deze Maand"
            value={formatCurrency(metrics.monthlyIncome)}
            icon={<Euro />}
            colorScheme="revenue"
            change={{
              value: "+12.5%",
              type: "positive",
              period: "vs vorige maand"
            }}
          />
          <MetricCard
            title="Uitgaven Deze Maand"
            value={formatCurrency(metrics.monthlyExpenses)}
            icon={<TrendingUp />}
            colorScheme="expense"
            change={{
              value: "+3.2%",
              type: "negative",
              period: "vs vorige maand"
            }}
          />
          <MetricCard
            title="Netto Cashflow"
            value={formatCurrency(metrics.netCashflow)}
            icon={<Briefcase />}
            colorScheme={metrics.netCashflow >= 0 ? "revenue" : "expense"}
            change={{
              value: "+24.1%",
              type: "positive",
              period: "vs vorige maand"
            }}
          />
          <MetricCard
            title="Pipeline Waarde"
            value={formatCurrency(metrics.pendingValue)}
            icon={<Clock />}
            colorScheme="pending"
            change={{
              value: "+8.7%",
              type: "positive",
              period: "vs vorige maand"
            }}
          />
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <CashflowChart data={mockCashflowData} timeframe="month" />
          <RecentDeals deals={data.deals} />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-card border border-border rounded-lg text-center">
            <h3 className="font-semibold mb-2">Nieuwe Deal Toevoegen</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Voeg een nieuwe deal toe aan je pipeline
            </p>
            <button className="btn-primary">
              Deal Toevoegen
            </button>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg text-center">
            <h3 className="font-semibold mb-2">Vaste Kosten Beheren</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Beheer je terugkerende uitgaven
            </p>
            <button className="btn-secondary">
              Kosten Beheren
            </button>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg text-center">
            <h3 className="font-semibold mb-2">Cashflow Projectie</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bekijk toekomstige cashflow trends
            </p>
            <button className="btn-secondary">
              Projectie Bekijken
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};