import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DailyCostData {
  date: string;
  fixedCosts: number;
  deals: number;
  total: number;
}

interface Deal {
  id: string;
  amount: number;
  payment_received_date: string | null;
  deal_type: string;
  monthly_amount: number | null;
  start_date: string | null;
}

interface FixedCost {
  id: string;
  amount: number;
  frequency: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export const useDailyCosts = (selectedMonth: Date) => {
  const [data, setData] = useState<DailyCostData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDailyCosts();
  }, [selectedMonth]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const fetchDailyCosts = async () => {
    try {
      setLoading(true);

      // Get month boundaries
      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      const daysInMonth = getDaysInMonth(selectedMonth);

      // Fetch fixed costs
      const { data: fixedCosts, error: fixedError } = await supabase
        .from('fixed_costs')
        .select('*')
        .eq('is_active', true);

      if (fixedError) throw fixedError;

      // Fetch deals for the month
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*');

      if (dealsError) throw dealsError;

      // Generate daily data
      const dailyData: DailyCostData[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Calculate daily fixed costs
        let dailyFixedCosts = 0;
        fixedCosts?.forEach((cost: FixedCost) => {
          const costStartDate = new Date(cost.start_date);
          const costEndDate = cost.end_date ? new Date(cost.end_date) : new Date(2030, 11, 31);

          // Check if cost is active for this date
          if (currentDate >= costStartDate && currentDate <= costEndDate) {
            let monthlyCost = 0;
            
            switch (cost.frequency) {
              case 'monthly':
                monthlyCost = Number(cost.amount);
                break;
              case 'yearly':
                monthlyCost = Number(cost.amount) / 12;
                break;
              case 'quarterly':
                monthlyCost = Number(cost.amount) / 3;
                break;
              default:
                monthlyCost = Number(cost.amount);
            }

            // Convert monthly to daily
            dailyFixedCosts += monthlyCost / daysInMonth;
          }
        });

        // Calculate daily deals income
        let dailyDeals = 0;
        deals?.forEach((deal: Deal) => {
          // One-time deals on payment date
          if (deal.deal_type === 'one_time' && deal.payment_received_date) {
            const paymentDate = new Date(deal.payment_received_date);
            if (paymentDate.toDateString() === currentDate.toDateString()) {
              dailyDeals += Number(deal.amount);
            }
          }

          // Recurring deals - daily MRR
          if (deal.deal_type === 'recurring' && deal.monthly_amount && deal.start_date) {
            const dealStartDate = new Date(deal.start_date);
            if (currentDate >= dealStartDate) {
              dailyDeals += Number(deal.monthly_amount) / daysInMonth;
            }
          }
        });

        dailyData.push({
          date: dateStr,
          fixedCosts: dailyFixedCosts,
          deals: dailyDeals,
          total: dailyDeals - dailyFixedCosts
        });
      }

      setData(dailyData);
    } catch (error) {
      console.error('Error fetching daily costs:', error);
      toast({
        title: "Fout",
        description: "Kon dagelijkse kosten niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalMonthlyFixedCosts = data.reduce((sum, day) => sum + day.fixedCosts, 0);
  const totalMonthlyDeals = data.reduce((sum, day) => sum + day.deals, 0);
  const totalMonthlyNet = totalMonthlyDeals - totalMonthlyFixedCosts;

  return {
    data,
    loading,
    refetch: fetchDailyCosts,
    summary: {
      totalFixedCosts: totalMonthlyFixedCosts,
      totalDeals: totalMonthlyDeals,
      totalNet: totalMonthlyNet
    }
  };
};