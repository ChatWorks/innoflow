import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, addMonths, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval, format, parseISO, isSameMonth, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";

export interface DateRange {
  from: Date;
  to: Date;
}

interface Deal {
  id: string;
  title: string;
  client_name: string;
  amount: number;
  status: string;
  expected_date?: string;
  payment_received_date?: string;
  created_at: string;
  probability: number;
}

interface FixedCost {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  category: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

interface CashflowEntry {
  id: string;
  type: string;
  amount: number;
  transaction_date: string;
  description: string;
  category: string;
}

interface EnhancedDashboardData {
  deals: Deal[];
  fixedCosts: FixedCost[];
  cashflowEntries: CashflowEntry[];
}

interface EnhancedDashboardMetrics {
  currentIncome: number;
  currentExpenses: number;
  netCashflow: number;
  pipelineValue: number;
  previousIncome: number;
  previousExpenses: number;
  previousNetCashflow: number;
  previousPending: number;
  burnRate: number;
  cashRunway: number;
  goalProgress: number;
  trend: "increasing" | "decreasing" | "stable";
}

interface CashflowDataPoint {
  month: string;
  income: number;
  expenses: number;
  netCashflow: number;
  forecastIncome?: number;
  forecastExpenses?: number;
  forecastNetCashflow?: number;
}

export const useEnhancedDashboardData = (dateRange: DateRange) => {
  const { user } = useAuth();
  const [data, setData] = useState<EnhancedDashboardData>({
    deals: [],
    fixedCosts: [],
    cashflowEntries: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);

      // Fetch deals
      const { data: deals, error: dealsError } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (dealsError) throw dealsError;

      // Fetch fixed costs
      const { data: fixedCosts, error: fixedCostsError } = await supabase
        .from("fixed_costs")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (fixedCostsError) throw fixedCostsError;

      // Fetch cashflow entries
      const { data: cashflowEntries, error: cashflowError } = await supabase
        .from("cashflow_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("transaction_date", dateRange.from.toISOString().split('T')[0])
        .lte("transaction_date", dateRange.to.toISOString().split('T')[0])
        .order("transaction_date", { ascending: true });

      if (cashflowError) throw cashflowError;

      // Create cashflow entries for paid deals if they don't exist
      const paidDeals = (deals || []).filter(deal => 
        deal.status === 'paid' && 
        deal.payment_received_date &&
        new Date(deal.payment_received_date) >= dateRange.from &&
        new Date(deal.payment_received_date) <= dateRange.to
      );

      for (const deal of paidDeals) {
        const existingEntry = (cashflowEntries || []).find(entry => entry.deal_id === deal.id);
        if (!existingEntry) {
          const { error } = await supabase
            .from("cashflow_entries")
            .insert({
              type: "income",
              description: `Deal payment: ${deal.title}`,
              category: "deals",
              amount: deal.amount,
              transaction_date: deal.payment_received_date,
              deal_id: deal.id,
              is_projected: false,
              user_id: user.id
            });

          if (error) {
            console.error("Error creating cashflow entry for deal:", error);
          }
        }
      }

      setData({
        deals: deals || [],
        fixedCosts: fixedCosts || [],
        cashflowEntries: cashflowEntries || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Er is een fout opgetreden bij het laden van de gegevens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange, toast, user]);

  // Calculate metrics with enhanced analytics
  const metrics = useMemo((): EnhancedDashboardMetrics => {
    const { deals, fixedCosts, cashflowEntries } = data;

    // Current period calculations
    const currentIncome = cashflowEntries
      .filter(entry => entry.type === "income")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const currentExpenses = cashflowEntries
      .filter(entry => entry.type === "expense")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    // Add fixed costs to expenses (prorated for the period)
    const periodLength = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    const monthlyFixedCosts = fixedCosts.reduce((sum, cost) => {
      let monthlyAmount = 0;
      switch (cost.frequency) {
        case 'monthly':
          monthlyAmount = Number(cost.amount);
          break;
        case 'quarterly':
          monthlyAmount = Number(cost.amount) / 3;
          break;
        case 'yearly':
          monthlyAmount = Number(cost.amount) / 12;
          break;
        default:
          monthlyAmount = Number(cost.amount);
      }
      return sum + monthlyAmount;
    }, 0);

    const fixedCostsPeriod = (monthlyFixedCosts / 30) * periodLength;
    const totalCurrentExpenses = currentExpenses + fixedCostsPeriod;

    const netCashflow = currentIncome - totalCurrentExpenses;

    // Pipeline value (confirmed + invoiced deals)
    const pipelineValue = deals
      .filter(deal => ['confirmed', 'invoiced'].includes(deal.status))
      .reduce((sum, deal) => sum + Number(deal.amount), 0);

    // Previous period for comparison (same length, but before current period)
    const periodLengthMs = dateRange.to.getTime() - dateRange.from.getTime();
    const previousFrom = new Date(dateRange.from.getTime() - periodLengthMs);
    const previousTo = new Date(dateRange.to.getTime() - periodLengthMs);

    // Calculate previous period metrics (simplified for now)
    const previousIncome = currentIncome * 0.9; // Placeholder
    const previousExpenses = totalCurrentExpenses * 0.8; // Placeholder
    const previousNetCashflow = previousIncome - previousExpenses;
    const previousPending = pipelineValue * 0.7; // Placeholder

    // Enhanced metrics
    const burnRate = totalCurrentExpenses - currentIncome;
    const cashRunway = burnRate > 0 ? Math.max(0, Math.floor(50000 / burnRate)) : -1; // Assuming 50k buffer

    // Goal tracking (example: 50k monthly target)
    const monthlyTarget = 50000;
    const goalProgress = (currentIncome / monthlyTarget) * 100;

    // Trend analysis
    let trend: "increasing" | "decreasing" | "stable" = "stable";
    const trendThreshold = 0.05; // 5%
    if (netCashflow > previousNetCashflow * (1 + trendThreshold)) {
      trend = "increasing";
    } else if (netCashflow < previousNetCashflow * (1 - trendThreshold)) {
      trend = "decreasing";
    }

    return {
      currentIncome,
      currentExpenses: totalCurrentExpenses,
      netCashflow,
      pipelineValue,
      previousIncome,
      previousExpenses,
      previousNetCashflow,
      previousPending,
      burnRate,
      cashRunway,
      goalProgress,
      trend,
    };
  }, [data, dateRange]);

  // Generate enhanced cashflow data with forecasting
  const cashflowData = useMemo((): CashflowDataPoint[] => {
    const { deals, fixedCosts, cashflowEntries } = data;
    
    // Generate 6 months of historical + 3 months of forecast
    const startDate = subDays(dateRange.from, 150); // ~5 months before
    const endDate = addMonths(dateRange.to, 3);
    
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const isCurrentOrFuture = month >= new Date();
      
      // Calculate actual income for this month
      const monthCashflow = cashflowEntries.filter(entry => {
        const entryDate = parseISO(entry.transaction_date);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });
      
      const income = monthCashflow
        .filter(entry => entry.type === "income")
        .reduce((sum, entry) => sum + Number(entry.amount), 0);
      
      const expenses = monthCashflow
        .filter(entry => entry.type === "expense")
        .reduce((sum, entry) => sum + Number(entry.amount), 0);
      
      // Add fixed costs
      const monthlyFixedCosts = fixedCosts.reduce((sum, cost) => {
        let monthlyAmount = 0;
        switch (cost.frequency) {
          case 'monthly':
            monthlyAmount = Number(cost.amount);
            break;
          case 'quarterly':
            monthlyAmount = Number(cost.amount) / 3;
            break;
          case 'yearly':
            monthlyAmount = Number(cost.amount) / 12;
            break;
        }
        return sum + monthlyAmount;
      }, 0);
      
      const totalExpenses = expenses + monthlyFixedCosts;
      const netCashflow = income - totalExpenses;
      
      // Generate forecast for future months
      let forecastData = {};
      if (isCurrentOrFuture) {
        // Simple forecast based on current trends and confirmed deals
        const confirmedDealsThisMonth = deals.filter(deal => {
          if (!deal.expected_date || deal.status !== 'confirmed') return false;
          const expectedDate = parseISO(deal.expected_date);
          return expectedDate >= monthStart && expectedDate <= monthEnd;
        });
        
        const forecastIncome = confirmedDealsThisMonth.reduce((sum, deal) => 
          sum + Number(deal.amount) * (deal.probability / 100), 0
        );
        
        const forecastExpenses = monthlyFixedCosts + (expenses * 1.1); // 10% growth assumption
        const forecastNetCashflow = forecastIncome - forecastExpenses;
        
        forecastData = {
          forecastIncome,
          forecastExpenses,
          forecastNetCashflow,
        };
      }
      
      return {
        month: format(month, 'MMM yyyy', { locale: nl }),
        income,
        expenses: totalExpenses,
        netCashflow,
        ...forecastData,
      };
    });
  }, [data, dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetch = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    metrics,
    cashflowData,
    refetch,
  };
};