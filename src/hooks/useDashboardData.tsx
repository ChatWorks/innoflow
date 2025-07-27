import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { TimePeriod } from "@/components/dashboard/TimeFilter";
import { calculateFixedCostsForPeriod, PeriodType } from "@/utils/cashflowCalculations";

interface DashboardData {
  deals: any[];
  fixedCosts: any[];
  cashflowEntries: any[];
}

interface DashboardMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingValue: number;
  netCashflow: number;
  previousIncome: number;
  previousExpenses: number;
  previousPending: number;
  previousNetCashflow: number;
}

export const useDashboardData = (period: TimePeriod, currentDate: Date) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    deals: [],
    fixedCosts: [],
    cashflowEntries: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getDateRange = useCallback((date: Date, period: TimePeriod) => {
    const start = new Date(date);
    const end = new Date(date);

    switch (period) {
      case "day":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek + 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "quarter":
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth((quarter + 1) * 3, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "year":
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }, []);

  const getPreviousDateRange = useCallback((date: Date, period: TimePeriod) => {
    const prevDate = new Date(date);
    
    switch (period) {
      case "day":
        prevDate.setDate(prevDate.getDate() - 1);
        break;
      case "week":
        prevDate.setDate(prevDate.getDate() - 7);
        break;
      case "month":
        prevDate.setMonth(prevDate.getMonth() - 1);
        break;
      case "quarter":
        prevDate.setMonth(prevDate.getMonth() - 3);
        break;
      case "year":
        prevDate.setFullYear(prevDate.getFullYear() - 1);
        break;
    }
    
    return getDateRange(prevDate, period);
  }, [getDateRange]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { start, end } = getDateRange(currentDate, period);

      // Fetch all deals first, then filter in memory based on relevant dates
      const { data: deals, error: dealsError } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (dealsError) {
        console.error("Error fetching deals:", dealsError);
        toast({
          title: "Error loading deals",
          description: "Could not load deals data",
          variant: "destructive",
        });
      }

      // Fetch fixed costs
      const { data: fixedCosts, error: costsError } = await supabase
        .from("fixed_costs")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (costsError) {
        console.error("Error fetching fixed costs:", costsError);
      }

      // Fetch cashflow entries within date range
      const { data: cashflowEntries, error: entriesError } = await supabase
        .from("cashflow_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("transaction_date", start.toISOString().split('T')[0])
        .lte("transaction_date", end.toISOString().split('T')[0])
        .order("transaction_date", { ascending: false });

      if (entriesError) {
        console.error("Error fetching cashflow entries:", entriesError);
      }

      // Filter deals based on relevant dates within the selected period
      const filteredDeals = (deals || []).filter(deal => {
        // For projection purposes, use expected/due dates rather than actual payment dates
        let relevantDate: Date | null = null;
        
        if (deal.payment_due_date) {
          // Prioritize payment due date for projection
          relevantDate = new Date(deal.payment_due_date);
        } else if (deal.expected_date) {
          // Use expected date as backup
          relevantDate = new Date(deal.expected_date);
        } else if (deal.status === 'invoiced' && deal.invoice_date) {
          // For invoiced deals without due date, use invoice date
          relevantDate = new Date(deal.invoice_date);
        } else if (deal.status === 'paid' && deal.payment_received_date) {
          // Only for already paid deals without other dates, use payment date
          relevantDate = new Date(deal.payment_received_date);
        } else {
          // Final fallback to creation date
          relevantDate = new Date(deal.created_at);
        }
        
        return relevantDate && relevantDate >= start && relevantDate <= end;
      });

      // Add deals as income entries for the current period based on expected dates
      const dealsForIncome = filteredDeals.filter(deal => {
        // Include all deals in the filtered period regardless of payment status
        // The filtering logic above already ensures they belong to this period
        return deal.status === "paid" || deal.status === "confirmed" || deal.status === "potential";
      });

      // Create virtual cashflow entries for deals that don't have entries yet
      const dealEntries = dealsForIncome.map(deal => {
        // Use the same date logic as filtering for consistency
        let transactionDate = deal.payment_due_date || deal.expected_date || deal.payment_received_date || deal.created_at;
        
        return {
          id: `deal-${deal.id}`,
          type: "income",
          description: `Deal inkomsten: ${deal.title}`,
          category: "deals",
          amount: deal.amount,
          transaction_date: transactionDate,
          deal_id: deal.id,
          is_projected: deal.status !== "paid",
          created_at: deal.created_at,
          updated_at: deal.updated_at,
          fixed_cost_id: null,
          user_id: deal.user_id
        };
      });

      // Combine actual cashflow entries with paid deal entries (avoid duplicates)
      const existingDealIds = (cashflowEntries || [])
        .filter(entry => entry.deal_id)
        .map(entry => entry.deal_id);
      
      const newDealEntries = dealEntries.filter(entry => 
        !existingDealIds.includes(entry.deal_id)
      );

      const allCashflowEntries = [...(cashflowEntries || []), ...newDealEntries];

      setData({
        deals: filteredDeals,
        fixedCosts: fixedCosts || [],
        cashflowEntries: allCashflowEntries || []
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
  }, [currentDate, period, getDateRange, toast, user]);

  const calculateMetrics = useCallback((): DashboardMetrics => {
    const { start, end } = getDateRange(currentDate, period);
    const { start: prevStart, end: prevEnd } = getPreviousDateRange(currentDate, period);

    // Calculate current period metrics using unified logic
    const monthlyIncome = data.cashflowEntries
      .filter(entry => entry.type === "income")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const monthlyExpenses = data.cashflowEntries
      .filter(entry => entry.type === "expense")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    // Calculate fixed costs for current period using unified logic
    const fixedCostExpenses = calculateFixedCostsForPeriod(
      data.fixedCosts,
      period as PeriodType,
      start,
      end
    );

    const totalExpenses = monthlyExpenses + fixedCostExpenses;

    // Calculate pipeline value (confirmed and potential deals)
    const pendingValue = data.deals
      .filter(deal => deal.status === "potential" || deal.status === "confirmed")
      .reduce((sum, deal) => sum + Number(deal.amount), 0);

    const netCashflow = monthlyIncome - totalExpenses;

    // For now, use placeholder values for previous period calculations
    // In a real app, you'd fetch data for the previous period
    const previousIncome = monthlyIncome * 0.9; // 10% less than current
    const previousExpenses = totalExpenses * 1.1; // 10% more than current
    const previousPending = pendingValue * 0.85; // 15% less than current
    const previousNetCashflow = previousIncome - previousExpenses;

    return {
      monthlyIncome,
      monthlyExpenses: totalExpenses,
      pendingValue,
      netCashflow,
      previousIncome,
      previousExpenses,
      previousPending,
      previousNetCashflow
    };
  }, [data, currentDate, period, getDateRange, getPreviousDateRange]);

  const generateCashflowData = useCallback(() => {
    const { start, end } = getDateRange(currentDate, period);
    const dataPoints = [];
    
    // Generate data points based on period
    let intervals = 1;
    let intervalType = 'day';
    
    switch (period) {
      case "day":
        intervals = 24;
        intervalType = 'hour';
        break;
      case "week":
        intervals = 7;
        intervalType = 'day';
        break;
      case "month":
        intervals = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
        intervalType = 'day';
        break;
      case "quarter":
        intervals = 3;
        intervalType = 'month';
        break;
      case "year":
        intervals = 12;
        intervalType = 'month';
        break;
    }

    for (let i = 0; i < intervals; i++) {
      const date = new Date(start);
      
      if (intervalType === 'hour') {
        date.setHours(i);
      } else if (intervalType === 'day') {
        date.setDate(start.getDate() + i);
      } else if (intervalType === 'month') {
        date.setMonth(start.getMonth() + i);
      }

      // Filter cashflow entries for this interval
      const intervalEntries = data.cashflowEntries.filter(entry => {
        const entryDate = new Date(entry.transaction_date);
        if (intervalType === 'hour') {
          return entryDate.getHours() === i && 
                 entryDate.toDateString() === start.toDateString();
        } else if (intervalType === 'day') {
          return entryDate.toDateString() === date.toDateString();
        } else if (intervalType === 'month') {
          return entryDate.getMonth() === date.getMonth() && 
                 entryDate.getFullYear() === date.getFullYear();
        }
        return false;
      });

      const income = intervalEntries
        .filter(entry => entry.type === "income")
        .reduce((sum, entry) => sum + Number(entry.amount), 0);
      
      const expensesFromEntries = intervalEntries
        .filter(entry => entry.type === "expense")
        .reduce((sum, entry) => sum + Number(entry.amount), 0);

      // Add fixed costs for this interval
      const intervalStart = new Date(date);
      const intervalEnd = new Date(date);
      if (intervalType === 'hour') {
        intervalStart.setHours(i, 0, 0, 0);
        intervalEnd.setHours(i, 59, 59, 999);
      } else if (intervalType === 'day') {
        intervalStart.setHours(0, 0, 0, 0);
        intervalEnd.setHours(23, 59, 59, 999);
      } else if (intervalType === 'month') {
        intervalStart.setDate(1);
        intervalStart.setHours(0, 0, 0, 0);
        intervalEnd.setMonth(date.getMonth() + 1);
        intervalEnd.setDate(0);
        intervalEnd.setHours(23, 59, 59, 999);
      }

      const fixedCostsForInterval = calculateFixedCostsForPeriod(
        data.fixedCosts,
        intervalType === 'hour' ? 'day' : (intervalType as PeriodType),
        intervalStart,
        intervalEnd
      );

      const totalExpenses = expensesFromEntries + fixedCostsForInterval;

      let label = '';
      if (intervalType === 'hour') {
        label = `${i}:00`;
      } else if (intervalType === 'day') {
        label = date.getDate().toString();
      } else if (intervalType === 'month') {
        label = date.toLocaleDateString('nl-NL', { month: 'short' });
      }

      dataPoints.push({
        month: label,
        income,
        expenses: totalExpenses,
        netCashflow: income - totalExpenses
      });
    }

    return dataPoints;
  }, [data.cashflowEntries, currentDate, period, getDateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    metrics: calculateMetrics(),
    cashflowData: generateCashflowData(),
    refetch: fetchDashboardData
  };
};