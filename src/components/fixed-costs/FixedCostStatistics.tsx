import { TrendingDown, Clock, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FixedCost {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  description?: string;
  is_active: boolean;
}

interface FixedCostStatisticsProps {
  fixedCosts: FixedCost[];
}

export const FixedCostStatistics = ({ fixedCosts }: FixedCostStatisticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMonthlyTotal = () => {
    return fixedCosts.reduce((total, cost) => {
      let monthlyAmount = cost.amount;
      if (cost.frequency === "yearly") {
        monthlyAmount = cost.amount / 12;
      } else if (cost.frequency === "quarterly") {
        monthlyAmount = cost.amount / 3;
      }
      return total + monthlyAmount;
    }, 0);
  };

  const calculateYearlyTotal = () => {
    return fixedCosts.reduce((total, cost) => {
      let yearlyAmount = cost.amount;
      if (cost.frequency === "monthly") {
        yearlyAmount = cost.amount * 12;
      } else if (cost.frequency === "quarterly") {
        yearlyAmount = cost.amount * 4;
      }
      return total + yearlyAmount;
    }, 0);
  };

  const getCategoryCounts = () => {
    const categories = fixedCosts.reduce((acc, cost) => {
      acc[cost.category] = (acc[cost.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(categories).length;
  };

  const getUpcomingExpirations = () => {
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
    
    return fixedCosts.filter(cost => {
      if (!cost.end_date) return false;
      const endDate = new Date(cost.end_date);
      return endDate >= now && endDate <= threeMonthsFromNow;
    }).length;
  };

  const stats = [
    {
      title: "Maandelijkse Kosten",
      value: formatCurrency(calculateMonthlyTotal()),
      icon: TrendingDown,
      description: `${fixedCosts.length} actieve kosten`,
      color: "bg-gradient-to-r from-red-500/10 to-red-500/5",
      iconColor: "text-red-600"
    },
    {
      title: "Jaarlijkse Impact",
      value: formatCurrency(calculateYearlyTotal()),
      icon: Calendar,
      description: "Totale jaarkosten",
      color: "bg-gradient-to-r from-orange-500/10 to-orange-500/5",
      iconColor: "text-orange-600"
    },
    {
      title: "Categorieën",
      value: getCategoryCounts().toString(),
      icon: DollarSign,
      description: "Verschillende types",
      color: "bg-gradient-to-r from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600"
    },
    {
      title: "Binnenkort Verlopen",
      value: getUpcomingExpirations().toString(),
      icon: Clock,
      description: "Binnen 3 maanden",
      color: "bg-gradient-to-r from-purple-500/10 to-purple-500/5",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className={`${stat.color} border-0 hover-scale animate-fade-in`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};