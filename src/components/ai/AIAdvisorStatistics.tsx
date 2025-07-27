import { TrendingUp, MessageSquare, Clock, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FinancialContext {
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashflow: number;
  pipelineValue: number;
  activeDeals: number;
  fixedCosts: number;
}

interface AIAdvisorStatisticsProps {
  context: FinancialContext;
}

export const AIAdvisorStatistics = ({ context }: AIAdvisorStatisticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getHealthScore = () => {
    // Simple health score calculation based on cashflow
    if (context.netCashflow > 5000) return { score: "Uitstekend", color: "text-green-600", bgColor: "from-green-500/10 to-green-500/5" };
    if (context.netCashflow > 1000) return { score: "Goed", color: "text-blue-600", bgColor: "from-blue-500/10 to-blue-500/5" };
    if (context.netCashflow > 0) return { score: "Stabiel", color: "text-yellow-600", bgColor: "from-yellow-500/10 to-yellow-500/5" };
    return { score: "Aandacht", color: "text-red-600", bgColor: "from-red-500/10 to-red-500/5" };
  };

  const getAdviceCount = () => {
    // Mock advice count - could be based on actual sessions
    return Math.max(1, context.activeDeals + Math.floor(context.fixedCosts / 2));
  };

  const healthScore = getHealthScore();

  const stats = [
    {
      title: "Financiële Gezondheid",
      value: healthScore.score,
      icon: TrendingUp,
      description: formatCurrency(context.netCashflow) + " cashflow",
      color: `bg-gradient-to-r ${healthScore.bgColor}`,
      iconColor: healthScore.color
    },
    {
      title: "AI Sessies",
      value: "24/7",
      icon: MessageSquare,
      description: "Beschikbaar voor advies",
      color: "bg-gradient-to-r from-purple-500/10 to-purple-500/5",
      iconColor: "text-purple-600"
    },
    {
      title: "Mogelijke Adviezen",
      value: getAdviceCount().toString(),
      icon: Brain,
      description: "Op basis van je data",
      color: "bg-gradient-to-r from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600"
    }
  ];

  return null;
};