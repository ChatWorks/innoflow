import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, Target } from "lucide-react";
import { AddDealModal } from "../dashboard/AddDealModal";

interface EmptyDealsStateProps {
  onDealsUpdate?: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export const EmptyDealsState = ({ onDealsUpdate, hasFilters, onClearFilters }: EmptyDealsStateProps) => {
  if (hasFilters) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-16 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Geen deals gevonden</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Er zijn geen deals die voldoen aan je huidige filters. 
            Probeer je zoekterm aan te passen of filters te wijzigen.
          </p>
          <Button variant="outline" onClick={onClearFilters}>
            Filters wissen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in border-dashed border-2">
      <CardContent className="py-16 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="relative z-10 pt-12">
            <div className="w-3 h-3 bg-primary rounded-full mx-auto animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Start je eerste deal</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Voeg je eerste deal toe om je sales pipeline te beginnen beheren. 
          Houd bij welke deals in behandeling zijn, bevestigd of al betaald.
        </p>
        
        <div className="space-y-4">
          <AddDealModal onSuccess={onDealsUpdate} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Potentiële deals bijhouden</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Pipeline overzicht</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Automatische cashflow</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};