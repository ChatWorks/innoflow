import { 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter, 
  startOfYear, 
  endOfYear,
  isWithinInterval
} from "date-fns";

export interface Deal {
  id: string;
  amount: number;
  payment_received_date: string | null;
  deal_type: string;
  monthly_amount: number | null;
  start_date: string | null;
  status: string;
}

export interface FixedCost {
  id: string;
  amount: number;
  frequency: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  name?: string;
}

export type PeriodType = "day" | "week" | "month" | "quarter" | "year";

/**
 * Calculate fixed costs for a specific period
 */
export const calculateFixedCostsForPeriod = (
  fixedCosts: FixedCost[],
  periodType: PeriodType,
  periodStart: Date,
  periodEnd: Date
): number => {
  let totalFixedCosts = 0;

  fixedCosts?.forEach(cost => {
    if (!cost.is_active) return;
    
    // Debug log for one_time costs
    if (cost.frequency === 'one_time') {
      console.log('Processing one_time cost:', cost.id, cost.amount, cost.start_date, 'for period:', periodType, periodStart.toISOString(), periodEnd.toISOString());
    }

    const costStartDate = new Date(cost.start_date);
    const costEndDate = cost.end_date ? new Date(cost.end_date) : new Date('2099-12-31');
    
    // Check if the cost period overlaps with our period
    if (costStartDate <= periodEnd && costEndDate >= periodStart) {
      const costAmount = Number(cost.amount);
      
      // Determine the actual active period within our selected period
      const activeStart = new Date(Math.max(costStartDate.getTime(), periodStart.getTime()));
      const activeEnd = new Date(Math.min(costEndDate.getTime(), periodEnd.getTime()));
      
      switch (periodType) {
        case "day":
          // For daily view, only count if the cost is active on this specific day
          if (activeStart <= periodStart && activeEnd >= periodStart) {
            if (cost.frequency === 'monthly') {
              const daysInMonth = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate();
              totalFixedCosts += costAmount / daysInMonth;
            } else if (cost.frequency === 'yearly') {
              totalFixedCosts += costAmount / 365;
            } else if (cost.frequency === 'quarterly') {
              totalFixedCosts += costAmount / 90;
            } else if (cost.frequency === 'one_time') {
              // For one-time costs, add the full amount on the start date
              // Parse the date correctly to avoid timezone issues
              const [year, month, day] = cost.start_date.split('-').map(Number);
              const costStartDay = new Date(year, month - 1, day);
              costStartDay.setHours(0, 0, 0, 0);
              const currentDay = new Date(periodStart);
              currentDay.setHours(0, 0, 0, 0);
              if (costStartDay.getTime() === currentDay.getTime()) {
                console.log('Adding one_time cost:', costAmount, 'on day:', currentDay.toISOString());
                totalFixedCosts += costAmount;
              } else {
                console.log('One_time cost date mismatch. Cost date:', costStartDay.toISOString(), 'Period date:', currentDay.toISOString());
              }
            }
          }
          break;
          
        case "week":
          // Calculate what portion of the week is active
          const weekStart = periodStart;
          const weekEnd = periodEnd;
          const activeWeekStart = new Date(Math.max(activeStart.getTime(), weekStart.getTime()));
          const activeWeekEnd = new Date(Math.min(activeEnd.getTime(), weekEnd.getTime()));
          const activeDaysInWeek = Math.ceil((activeWeekEnd.getTime() - activeWeekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const totalDaysInWeek = 7;
          const weekFraction = Math.min(activeDaysInWeek / totalDaysInWeek, 1);
          
          if (cost.frequency === 'monthly') {
            totalFixedCosts += (costAmount / 4.33) * weekFraction;
          } else if (cost.frequency === 'yearly') {
            totalFixedCosts += (costAmount / 52) * weekFraction;
          } else if (cost.frequency === 'quarterly') {
            totalFixedCosts += (costAmount / 13) * weekFraction;
          } else if (cost.frequency === 'one_time') {
            // For one-time costs, add the full amount if the start date falls within this week
            const costStartDate = new Date(cost.start_date);
            if (isWithinInterval(costStartDate, { start: periodStart, end: periodEnd })) {
              totalFixedCosts += costAmount;
            }
          }
          break;
          
        case "month":
          // Calculate what portion of the month is active
          const monthStart = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
          const monthEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
          const activeMonthStart = new Date(Math.max(activeStart.getTime(), monthStart.getTime()));
          const activeMonthEnd = new Date(Math.min(activeEnd.getTime(), monthEnd.getTime()));
          const activeDaysInMonth = Math.ceil((activeMonthEnd.getTime() - activeMonthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const totalDaysInMonth = monthEnd.getDate();
          const monthFraction = Math.min(activeDaysInMonth / totalDaysInMonth, 1);
          
          if (cost.frequency === 'monthly') {
            totalFixedCosts += costAmount * monthFraction;
          } else if (cost.frequency === 'yearly') {
            totalFixedCosts += (costAmount / 12) * monthFraction;
          } else if (cost.frequency === 'quarterly') {
            totalFixedCosts += (costAmount / 3) * monthFraction;
          } else if (cost.frequency === 'one_time') {
            // For one-time costs, add the full amount if the start date falls within this month
            const costStartDate = new Date(cost.start_date);
            if (isWithinInterval(costStartDate, { start: periodStart, end: periodEnd })) {
              totalFixedCosts += costAmount;
            }
          }
          break;
          
        case "quarter":
          // Calculate what portion of the quarter is active
          const quarterStart = periodStart;
          const quarterEnd = periodEnd;
          const activeQuarterStart = new Date(Math.max(activeStart.getTime(), quarterStart.getTime()));
          const activeQuarterEnd = new Date(Math.min(activeEnd.getTime(), quarterEnd.getTime()));
          const activeDaysInQuarter = Math.ceil((activeQuarterEnd.getTime() - activeQuarterStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const totalDaysInQuarter = Math.ceil((quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const quarterFraction = Math.min(activeDaysInQuarter / totalDaysInQuarter, 1);
          
          if (cost.frequency === 'monthly') {
            totalFixedCosts += (costAmount * 3) * quarterFraction;
          } else if (cost.frequency === 'yearly') {
            totalFixedCosts += (costAmount / 4) * quarterFraction;
          } else if (cost.frequency === 'quarterly') {
            totalFixedCosts += costAmount * quarterFraction;
          } else if (cost.frequency === 'one_time') {
            // For one-time costs, add the full amount if the start date falls within this quarter
            const costStartDate = new Date(cost.start_date);
            if (isWithinInterval(costStartDate, { start: periodStart, end: periodEnd })) {
              totalFixedCosts += costAmount;
            }
          }
          break;
          
        case "year":
          // Calculate what portion of the year is active
          const yearStart = new Date(periodStart.getFullYear(), 0, 1);
          const yearEnd = new Date(periodStart.getFullYear(), 11, 31);
          const activeYearStart = new Date(Math.max(activeStart.getTime(), yearStart.getTime()));
          const activeYearEnd = new Date(Math.min(activeEnd.getTime(), yearEnd.getTime()));
          const activeDaysInYear = Math.ceil((activeYearEnd.getTime() - activeYearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const totalDaysInYear = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const yearFraction = Math.min(activeDaysInYear / totalDaysInYear, 1);
          
          if (cost.frequency === 'monthly') {
            totalFixedCosts += (costAmount * 12) * yearFraction;
          } else if (cost.frequency === 'yearly') {
            totalFixedCosts += costAmount * yearFraction;
          } else if (cost.frequency === 'quarterly') {
            totalFixedCosts += (costAmount * 4) * yearFraction;
          } else if (cost.frequency === 'one_time') {
            // For one-time costs, add the full amount if the start date falls within this year
            const costStartDate = new Date(cost.start_date);
            if (isWithinInterval(costStartDate, { start: periodStart, end: periodEnd })) {
              totalFixedCosts += costAmount;
            }
          }
          break;
      }
    }
  });

  return totalFixedCosts;
};

/**
 * Calculate deals income for a specific period
 */
export const calculateDealsForPeriod = (
  deals: Deal[],
  periodType: PeriodType,
  periodStart: Date,
  periodEnd: Date
): number => {
  let totalDeals = 0;

  deals?.forEach(deal => {
    // One-time deals on payment date
    if (deal.deal_type === 'one_time' && deal.payment_received_date && deal.status === 'paid') {
      const paymentDate = new Date(deal.payment_received_date);
      if (isWithinInterval(paymentDate, { start: periodStart, end: periodEnd })) {
        totalDeals += Number(deal.amount);
      }
    }

    // Recurring deals - calculate based on period
    if (deal.deal_type === 'recurring' && deal.monthly_amount && deal.start_date) {
      const dealStartDate = new Date(deal.start_date);
      if (dealStartDate <= periodEnd) {
        const monthlyAmount = Number(deal.monthly_amount);
        
        switch (periodType) {
          case "day":
            const daysInMonth = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate();
            totalDeals += monthlyAmount / daysInMonth;
            break;
          case "week":
            totalDeals += monthlyAmount / 4.33; // ~4.33 weeks per month
            break;
          case "month":
            totalDeals += monthlyAmount;
            break;
          case "quarter":
            totalDeals += monthlyAmount * 3;
            break;
          case "year":
            totalDeals += monthlyAmount * 12;
            break;
        }
      }
    }
  });

  return totalDeals;
};

/**
 * Get period boundaries for different period types
 */
export const getPeriodBoundaries = (date: Date, periodType: PeriodType) => {
  switch (periodType) {
    case "day":
      return { start: startOfDay(date), end: endOfDay(date) };
    case "week":
      // For week, show the week containing the date
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return { start: startOfWeek, end: endOfWeek };
    case "month":
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case "quarter":
      return { start: startOfQuarter(date), end: endOfQuarter(date) };
    case "year":
      return { start: startOfYear(date), end: endOfYear(date) };
    default:
      return { start: startOfMonth(date), end: endOfMonth(date) };
  }
};