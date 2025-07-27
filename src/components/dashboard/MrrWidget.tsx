import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Euro, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MrrData {
  currentMrr: number;
  previousMrr: number;
  growth: number;
  churnRate: number;
  activeContracts: number;
}

export function MrrWidget() {
  const [data, setData] = useState<MrrData>({
    currentMrr: 0,
    previousMrr: 0,
    growth: 0,
    churnRate: 0,
    activeContracts: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMrrData();
  }, []);

  const fetchMrrData = async () => {
    try {
      setLoading(true);
      
      // Fetch active recurring deals
      const { data: recurringDeals, error } = await supabase
        .from('deals')
        .select('*')
        .eq('deal_type', 'recurring')
        .eq('status', 'confirmed');

      if (error) throw error;

      // Calculate current MRR
      const currentMrr = recurringDeals?.reduce((sum, deal) => 
        sum + (Number(deal.monthly_amount) || 0), 0) || 0;

      // For demo purposes, simulate previous month data
      // In a real app, you'd query historical data
      const previousMrr = currentMrr * 0.85; // Simulate 15% growth
      const growth = previousMrr > 0 ? ((currentMrr - previousMrr) / previousMrr) * 100 : 0;
      
      setData({
        currentMrr,
        previousMrr,
        growth,
        churnRate: 5.2, // Demo churn rate
        activeContracts: recurringDeals?.length || 0
      });

    } catch (error) {
      console.error('Error fetching MRR data:', error);
      toast({
        title: "Fout",
        description: "Kon MRR data niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Monthly Recurring Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted animate-pulse rounded" />
              <div className="h-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Monthly Recurring Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(data.currentMrr)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {data.growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={data.growth >= 0 ? "text-green-500" : "text-red-500"}>
                {data.growth >= 0 ? "+" : ""}{data.growth.toFixed(1)}%
              </span>
              <span>vs vorige maand</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Actieve Contracten</div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xl font-semibold">{data.activeContracts}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Churn Rate</div>
              <div className="text-xl font-semibold text-orange-500">
                {data.churnRate}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}