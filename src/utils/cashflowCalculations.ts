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

    const costStartDate = new Date(cost.start_date);
    const costEndDate = cost.end_date ? new Date(cost.end_date) : new Date('2099-12-31');
    
    // Check if the cost period overlaps with our period
    if (costStartDate <= periodEnd && costEndDate >= periodStart) {
      const costAmount = Number(cost.amount);
      
      switch (periodType) {
        case "day":
          // For daily view, divide by appropriate time unit
          if (cost.frequency === 'monthly') {
            const daysInMonth = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate();
            totalFixedCosts += costAmount / daysInMonth;
          } else if (cost.frequency === 'yearly') {
            totalFixedCosts += costAmount / 365;
          } else if (cost.frequency === 'quarterly') {
            totalFixedCosts += costAmount / 90; // ~90 days per quarter
          }
          break;
          
        case "week":
          if (cost.frequency === 'monthly') {
            totalFixedCosts += costAmount / 4.33; // ~4.33 weeks per month
          } else if (cost.frequency === 'yearly') {
            totalFixedCosts += costAmount / 52; // 52 weeks per year
          } else if (cost.frequency === 'quarterly') {
            totalFixedCosts += costAmount / 13; // ~13 weeks per quarter
          }
          break;
          
        case "month":
          if (cost.frequency === 'monthly') {
            totalFixedCosts += costAmount;
          } else if (cost.frequency === 'yearly') {
            totalFixedCosts += costAmount / 12;
          } else if (cost.frequency === 'quarterly') {
            totalFixedCosts += costAmount / 3;
          }
          break;
          
        case "quarter":
          if (cost.frequency === 'monthly') {
            totalFixedCosts += costAmount * 3;
          } else if (cost.frequency === 'yearly') {
            totalFixedCosts += costAmount / 4;
          } else if (cost.frequency === 'quarterly') {
            totalFixedCosts += costAmount;
          }
          break;
          
        case "year":
          if (cost.frequency === 'monthly') {
            totalFixedCosts += costAmount * 12;
          } else if (cost.frequency === 'yearly') {
            totalFixedCosts += costAmount;
          } else if (cost.frequency === 'quarterly') {
            totalFixedCosts += costAmount * 4;
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