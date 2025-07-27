import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, BarChart3, DollarSign } from "lucide-react";
import { AddDealModal } from "./AddDealModal";
import { AddFixedCostModal } from "./AddFixedCostModal";

interface EmptyDashboardStateProps {
  onDealsUpdate?: () => void;
  onFixedCostsUpdate?: () => void;
}

export const EmptyDashboardState = ({ onDealsUpdate, onFixedCostsUpdate }: EmptyDashboardStateProps) => {
  return (
    <Card className="animate-fade-in border-dashed border-2">
      <CardContent className="py-16 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="relative z-10 pt-12">
            <div className="w-3 h-3 bg-primary rounded-full mx-auto animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Welkom bij Innoflow</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Begin met het toevoegen van je eerste deal of vaste kosten om je 
          cashflow dashboard tot leven te brengen.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <AddDealModal onSuccess={onDealsUpdate} />
          
          <AddFixedCostModal onSuccess={onFixedCostsUpdate} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Real-time cashflow tracking</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Automatische projecties</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span>Pipeline management</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};