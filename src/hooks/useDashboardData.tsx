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
  recurringRevenue: any[];
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
    cashflowEntries: [],
    recurringRevenue: []
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

      // Fetch all deals
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

      // Fetch recurring revenue for MRR calculations
      const { data: recurringRevenue, error: recurringError } = await supabase
        .from("recurring_revenue")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (recurringError) {
        console.error("Error fetching recurring revenue:", recurringError);
      }

      // Filter deals based on correct criteria for each deal type
      const filteredDeals = (deals || []).filter(deal => {
        // Voor eenmalige deals: gebruik payment_received_date
        if (deal.deal_type === 'one_time' && deal.payment_received_date) {
          const paymentDate = new Date(deal.payment_received_date);
          return paymentDate >= start && paymentDate <= end;
        }
        
        // Voor MRR deals: gebruik start_date en check of actief in periode
        if (deal.deal_type === 'recurring' && deal.start_date) {
          const startDate = new Date(deal.start_date);
          return startDate <= end; // MRR deal is actief als het gestart is voor/tijdens periode
        }
        
        // Fallback voor andere deals
        if (deal.expected_date) {
          const expectedDate = new Date(deal.expected_date);
          return expectedDate >= start && expectedDate <= end;
        }
        
        if (deal.payment_due_date) {
          const dueDate = new Date(deal.payment_due_date);
          return dueDate >= start && dueDate <= end;
        }
        
        return false;
      });

      setData({
        deals: filteredDeals,
        fixedCosts: fixedCosts || [],
        cashflowEntries: [],
        recurringRevenue: recurringRevenue || []
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

    // Calculate income from deals with correct MRR logic
    const monthlyIncome = data.deals
      .filter(deal => {
        // Eenmalige deals: alleen 'paid'
        if (deal.deal_type === 'one_time') {
          return deal.status === 'paid';
        }
        // MRR deals: 'confirmed' of 'paid'
        if (deal.deal_type === 'recurring') {
          return deal.status === 'confirmed' || deal.status === 'paid';
        }
        return false;
      })
      .reduce((sum, deal) => {
        // Voor eenmalige deals: gebruik amount
        if (deal.deal_type === 'one_time') {
          return sum + Number(deal.amount);
        }
        // Voor MRR deals: gebruik monthly_amount
        if (deal.deal_type === 'recurring') {
          return sum + Number(deal.monthly_amount || 0);
        }
        return sum;
      }, 0);

    // Calculate fixed costs for current period
    const fixedCostExpenses = calculateFixedCostsForPeriod(
      data.fixedCosts,
      period as PeriodType,
      start,
      end
    );

    const totalExpenses = fixedCostExpenses;

    // Calculate pipeline value (confirmed and potential deals)
    const pendingValue = data.deals
      .filter(deal => deal.status === "potential" || deal.status === "confirmed")
      .reduce((sum, deal) => sum + Number(deal.amount), 0);

    const netCashflow = monthlyIncome - totalExpenses;

    // For previous period calculations, use simple placeholders
    const previousIncome = monthlyIncome * 0.9;
    const previousExpenses = totalExpenses * 1.1;
    const previousPending = pendingValue * 0.85;
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
  }, [data, currentDate, period, getDateRange]);

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

      // Filter deals for this interval using payment_received_date
      const intervalDeals = data.deals.filter(deal => {
        if (!deal.payment_received_date) return false;
        
        const paymentDate = new Date(deal.payment_received_date);
        if (intervalType === 'hour') {
          return paymentDate.getHours() === i && 
                 paymentDate.toDateString() === start.toDateString();
        } else if (intervalType === 'day') {
          return paymentDate.toDateString() === date.toDateString();
        } else if (intervalType === 'month') {
          return paymentDate.getMonth() === date.getMonth() && 
                 paymentDate.getFullYear() === date.getFullYear();
        }
        return false;
      });

      // Calculate income with proper MRR logic
      let income = 0;

      // Eenmalige deals
      income += intervalDeals
        .filter(deal => deal.deal_type === 'one_time' && deal.status === 'paid')
        .reduce((sum, deal) => sum + Number(deal.amount), 0);

      // MRR deals - voeg maandelijks bedrag toe als deal actief is in dit interval
      income += intervalDeals
        .filter(deal => deal.deal_type === 'recurring' && (deal.status === 'confirmed' || deal.status === 'paid'))
        .reduce((sum, deal) => {
          if (deal.start_date) {
            const startDate = new Date(deal.start_date);
            // Check of MRR deal actief is in dit interval
            if (startDate <= date) {
              return sum + Number(deal.monthly_amount || 0);
            }
          }
          return sum;
        }, 0);

      // Calculate fixed costs for this interval
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
        expenses: fixedCostsForInterval,
        netCashflow: income - fixedCostsForInterval
      });
    }

    return dataPoints;
  }, [data.deals, data.fixedCosts, currentDate, period, getDateRange]);

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