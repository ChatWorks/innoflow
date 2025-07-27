import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TimePeriod } from "@/components/dashboard/TimeFilter";

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
    try {
      setLoading(true);
      const { start, end } = getDateRange(currentDate, period);

      // Fetch deals
      const { data: deals, error: dealsError } = await supabase
        .from("deals")
        .select("*")
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
        .eq("is_active", true);

      if (costsError) {
        console.error("Error fetching fixed costs:", costsError);
      }

      // Fetch cashflow entries within date range
      const { data: cashflowEntries, error: entriesError } = await supabase
        .from("cashflow_entries")
        .select("*")
        .gte("transaction_date", start.toISOString().split('T')[0])
        .lte("transaction_date", end.toISOString().split('T')[0])
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
  }, [currentDate, period, getDateRange, toast]);

  const calculateMetrics = useCallback((): DashboardMetrics => {
    const { start, end } = getDateRange(currentDate, period);
    const { start: prevStart, end: prevEnd } = getPreviousDateRange(currentDate, period);

    // Calculate current period metrics
    const monthlyIncome = data.cashflowEntries
      .filter(entry => entry.type === "income")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const monthlyExpenses = data.cashflowEntries
      .filter(entry => entry.type === "expense")
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    // Add fixed costs to expenses for current period
    const fixedCostExpenses = data.fixedCosts.reduce((sum, cost) => {
      const costStart = new Date(cost.start_date);
      if (costStart <= end) {
        let monthlyAmount = cost.amount;
        if (cost.frequency === "yearly") {
          monthlyAmount = cost.amount / 12;
        } else if (cost.frequency === "quarterly") {
          monthlyAmount = cost.amount / 3;
        }
        
        // Calculate how much of the period is covered
        if (period === "day") {
          monthlyAmount = monthlyAmount / 30; // Rough daily amount
        } else if (period === "week") {
          monthlyAmount = monthlyAmount / 4; // Rough weekly amount
        }
        
        return sum + monthlyAmount;
      }
      return sum;
    }, 0);

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
      
      const expenses = intervalEntries
        .filter(entry => entry.type === "expense")
        .reduce((sum, entry) => sum + Number(entry.amount), 0);

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
        expenses,
        netCashflow: income - expenses
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