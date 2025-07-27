import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TimePeriodType } from "@/components/dashboard/TimeRangeSelector";
import { 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter, 
  startOfYear, 
  endOfYear,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachYearOfInterval,
  isWithinInterval
} from "date-fns";

export interface CashflowDataPoint {
  date: string;
  deals: number;
  fixedCosts: number;
  total: number;
  period: string;
}

export interface CashflowSummary {
  totalDeals: number;
  totalFixedCosts: number;
  totalNet: number;
}

export const useEnhancedCashflowData = (periodType: TimePeriodType, selectedDate: Date) => {
  const { user } = useAuth();
  const [data, setData] = useState<CashflowDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CashflowSummary>({
    totalDeals: 0,
    totalFixedCosts: 0,
    totalNet: 0
  });

  const getDateRange = (date: Date, type: TimePeriodType) => {
    switch (type) {
      case "day":
        // Show full month for day view
        return { start: startOfMonth(date), end: endOfMonth(date) };
      case "month":
        // Show full year for month view
        return { start: startOfYear(date), end: endOfYear(date) };
      case "quarter":
        // Show full year for quarter view
        return { start: startOfYear(date), end: endOfYear(date) };
      case "year":
        // Show 5 years: 2 before, current, 2 after
        const startYear = new Date(date.getFullYear() - 2, 0, 1);
        const endYear = new Date(date.getFullYear() + 2, 11, 31);
        return { start: startYear, end: endYear };
      default:
        return { start: startOfYear(date), end: endOfYear(date) };
    }
  };

  const generateDateIntervals = (start: Date, end: Date, type: TimePeriodType) => {
    switch (type) {
      case "day":
        return eachDayOfInterval({ start, end });
      case "month":
        return eachMonthOfInterval({ start, end });
      case "quarter":
        return eachQuarterOfInterval({ start, end });
      case "year":
        return eachYearOfInterval({ start, end });
      default:
        return eachDayOfInterval({ start, end });
    }
  };

  const formatPeriodLabel = (date: Date, type: TimePeriodType) => {
    switch (type) {
      case "day":
        return format(date, "d MMM");
      case "month":
        return format(date, "MMM yyyy");
      case "quarter":
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case "year":
        return format(date, "yyyy");
      default:
        return format(date, "d MMM");
    }
  };

  useEffect(() => {
    if (user) {
      const fetchCashflowData = async () => {
      setLoading(true);
      
      try {
        const { start, end } = getDateRange(selectedDate, periodType);
        
        // Fetch deals
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .eq('user_id', user?.id)
          .gte('payment_received_date', start.toISOString().split('T')[0])
          .lte('payment_received_date', end.toISOString().split('T')[0])
          .eq('status', 'paid');

        if (dealsError) throw dealsError;

        // Fetch fixed costs
        const { data: fixedCosts, error: fixedCostsError } = await supabase
          .from('fixed_costs')
          .select('*')
          .eq('user_id', user?.id)
          .eq('is_active', true);

        if (fixedCostsError) throw fixedCostsError;

        // Generate intervals for the selected period
        const intervals = generateDateIntervals(start, end, periodType);
        
        const processedData: CashflowDataPoint[] = intervals.map(intervalDate => {
          const intervalStart = periodType === "day" 
            ? startOfDay(intervalDate)
            : periodType === "month"
            ? startOfMonth(intervalDate)
            : periodType === "quarter"
            ? startOfQuarter(intervalDate)
            : startOfYear(intervalDate);
            
          const intervalEnd = periodType === "day"
            ? endOfDay(intervalDate)
            : periodType === "month"
            ? endOfMonth(intervalDate)
            : periodType === "quarter"
            ? endOfQuarter(intervalDate)
            : endOfYear(intervalDate);

          // Calculate deals for this interval
          const intervalDeals = deals?.filter(deal => {
            if (!deal.payment_received_date) return false;
            const dealDate = new Date(deal.payment_received_date);
            return isWithinInterval(dealDate, { start: intervalStart, end: intervalEnd });
          }) || [];

          const totalDeals = intervalDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);

          // Calculate fixed costs for this interval
          let totalFixedCosts = 0;
          fixedCosts?.forEach(cost => {
            const costStartDate = new Date(cost.start_date);
            const costEndDate = cost.end_date ? new Date(cost.end_date) : new Date('2099-12-31');
            
            // Check if the cost period overlaps with our interval
            if (costStartDate <= intervalEnd && costEndDate >= intervalStart) {
              switch (periodType) {
                case "day":
                  // For daily view, divide monthly costs by days in month
                  if (cost.frequency === 'monthly') {
                    const daysInMonth = new Date(intervalDate.getFullYear(), intervalDate.getMonth() + 1, 0).getDate();
                    totalFixedCosts += Number(cost.amount) / daysInMonth;
                  } else if (cost.frequency === 'yearly') {
                    const daysInYear = 365;
                    totalFixedCosts += Number(cost.amount) / daysInYear;
                  }
                  break;
                case "month":
                  if (cost.frequency === 'monthly') {
                    totalFixedCosts += Number(cost.amount);
                  } else if (cost.frequency === 'yearly') {
                    totalFixedCosts += Number(cost.amount) / 12;
                  }
                  break;
                case "quarter":
                  if (cost.frequency === 'monthly') {
                    totalFixedCosts += Number(cost.amount) * 3;
                  } else if (cost.frequency === 'yearly') {
                    totalFixedCosts += Number(cost.amount) / 4;
                  }
                  break;
                case "year":
                  if (cost.frequency === 'monthly') {
                    totalFixedCosts += Number(cost.amount) * 12;
                  } else if (cost.frequency === 'yearly') {
                    totalFixedCosts += Number(cost.amount);
                  }
                  break;
              }
            }
          });

          return {
            date: format(intervalDate, 'yyyy-MM-dd'),
            period: formatPeriodLabel(intervalDate, periodType),
            deals: totalDeals,
            fixedCosts: totalFixedCosts,
            total: totalDeals - totalFixedCosts
          };
        });

        setData(processedData);

        // Calculate summary
        const totalDealsSum = processedData.reduce((sum, item) => sum + item.deals, 0);
        const totalFixedCostsSum = processedData.reduce((sum, item) => sum + item.fixedCosts, 0);
        
        setSummary({
          totalDeals: totalDealsSum,
          totalFixedCosts: totalFixedCostsSum,
          totalNet: totalDealsSum - totalFixedCostsSum
        });

      } catch (error) {
        console.error('Error fetching cashflow data:', error);
        setData([]);
        setSummary({ totalDeals: 0, totalFixedCosts: 0, totalNet: 0 });
      } finally {
        setLoading(false);
      }
      };

      fetchCashflowData();
    }
  }, [selectedDate, periodType, user]);

  return { data, loading, summary };
};