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
      
      {/* Start Chat Button */}
      <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 hover-scale animate-fade-in bg-gradient-to-r from-primary/5 to-primary/10 group cursor-pointer transition-all duration-200"
            style={{ animationDelay: "300ms" }}>
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mx-auto mb-3 transition-colors">
              <MessageSquare className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
              Nieuwe Chat
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Starten
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};