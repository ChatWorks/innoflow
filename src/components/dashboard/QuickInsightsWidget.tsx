import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Target, 
  Clock,
  DollarSign,
  ArrowRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "success" | "warning" | "info" | "urgent";
  title: string;
  description: string;
  value?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon: React.ReactNode;
}

interface QuickInsightsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashflow: number;
  pipelineValue: number;
  deals: any[];
  fixedCosts: any[];
}

export const QuickInsightsWidget = ({
  monthlyIncome,
  monthlyExpenses,
  netCashflow,
  pipelineValue,
  deals,
  fixedCosts
}: QuickInsightsProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const generateInsights = () => {
    const newInsights: Insight[] = [];

    // Biggest deal this month
    const paidDeals = deals.filter(deal => deal.status === 'paid');
    if (paidDeals.length > 0) {
      const biggestDeal = paidDeals.reduce((max, deal) => 
        deal.amount > max.amount ? deal : max
      );
      newInsights.push({
        id: 'biggest-deal',
        type: 'success',
        title: 'Grootste deal deze maand',
        description: `${biggestDeal.client_name} - ${formatCurrency(biggestDeal.amount)}`,
        icon: <DollarSign className="h-4 w-4" />,
        value: formatCurrency(biggestDeal.amount)
      });
    }

    // Next payment expected
    const confirmedDeals = deals.filter(deal => deal.status === 'confirmed' && deal.expected_date);
    if (confirmedDeals.length > 0) {
      const nextDeal = confirmedDeals
        .sort((a, b) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime())[0];
      
      const expectedDate = new Date(nextDeal.expected_date);
      const formattedDate = expectedDate.toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'short' 
      });

      newInsights.push({
        id: 'next-payment',
        type: 'info',
        title: 'Volgende betaling verwacht',
        description: `${formattedDate} - ${formatCurrency(nextDeal.amount)}`,
        icon: <Calendar className="h-4 w-4" />,
        value: formatCurrency(nextDeal.amount)
      });
    }

    // Deals nearing deadline
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nearDeadline = deals.filter(deal => 
      deal.expected_date && 
      new Date(deal.expected_date) <= oneWeekFromNow &&
      new Date(deal.expected_date) >= now &&
      deal.status !== 'paid'
    );

    if (nearDeadline.length > 0) {
      newInsights.push({
        id: 'deadline-warning',
        type: 'warning',
        title: 'Actie vereist',
        description: `${nearDeadline.length} deals naderen deadline`,
        icon: <AlertTriangle className="h-4 w-4" />,
        action: {
          label: 'Bekijk deals',
          onClick: () => {} // Will be handled by parent
        }
      });
    }

    // Cashflow trend
    const trendDirection = netCashflow > 0 ? 'positief' : 'negatief';
    const trendIcon = netCashflow > 0 ? 'stijgend' : 'dalend';
    newInsights.push({
      id: 'cashflow-trend',
      type: netCashflow > 0 ? 'success' : 'warning',
      title: 'Cashflow trend',
      description: `${trendIcon} laatste 30 dagen - ${trendDirection}`,
      icon: <TrendingUp className="h-4 w-4" />,
      value: formatCurrency(netCashflow)
    });

    // Burn rate warning
    if (monthlyExpenses > monthlyIncome && monthlyIncome > 0) {
      const burnRate = monthlyExpenses - monthlyIncome;
      newInsights.push({
        id: 'burn-rate',
        type: 'urgent',
        title: 'Burn rate waarschuwing',
        description: `Uitgaven overschrijden inkomsten met ${formatCurrency(burnRate)}`,
        icon: <AlertTriangle className="h-4 w-4" />,
        value: formatCurrency(burnRate)
      });
    }

    // Goal tracking (example: 50k monthly target)
    const monthlyTarget = 50000; // This could be configurable
    const targetProgress = (monthlyIncome / monthlyTarget) * 100;
    newInsights.push({
      id: 'goal-tracking',
      type: targetProgress >= 100 ? 'success' : targetProgress >= 75 ? 'info' : 'warning',
      title: 'Maandtarget voortgang',
      description: `€ ${(monthlyTarget / 1000).toFixed(0)}k target - ${targetProgress.toFixed(0)}% bereikt`,
      icon: <Target className="h-4 w-4" />,
      value: `${targetProgress.toFixed(0)}%`
    });

    setInsights(newInsights);
  };

  useEffect(() => {
    generateInsights();
  }, [monthlyIncome, monthlyExpenses, netCashflow, pipelineValue, deals, fixedCosts]);

  useEffect(() => {
    if (insights.length > 1) {
      const timer = setInterval(() => {
        setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [insights.length]);

  const getInsightBadgeVariant = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'urgent':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-success bg-success/5';
      case 'warning':
        return 'border-l-warning bg-warning/5';
      case 'urgent':
        return 'border-l-destructive bg-destructive/5';
      default:
        return 'border-l-primary bg-primary/5';
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            <p className="text-sm">Insights worden geladen...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentInsight = insights[currentInsightIndex];

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Quick Insights
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {currentInsightIndex + 1}/{insights.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={cn(
          "p-4 rounded-lg border-l-4 transition-all duration-500",
          getInsightColor(currentInsight.type)
        )}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {currentInsight.icon}
              <h3 className="font-semibold text-sm">{currentInsight.title}</h3>
            </div>
            {currentInsight.value && (
              <Badge variant={getInsightBadgeVariant(currentInsight.type)} className="text-xs">
                {currentInsight.value}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {currentInsight.description}
          </p>
          
          {currentInsight.action && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs font-medium hover:no-underline"
              onClick={currentInsight.action.onClick}
            >
              {currentInsight.action.label}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        {/* Progress indicators */}
        {insights.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-4">
            {insights.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentInsightIndex 
                    ? "w-6 bg-primary" 
                    : "w-1.5 bg-muted hover:bg-muted-foreground"
                )}
                onClick={() => setCurrentInsightIndex(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};