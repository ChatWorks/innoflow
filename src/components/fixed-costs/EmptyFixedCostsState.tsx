import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, Plus, Receipt } from "lucide-react";
import { AddFixedCostModal } from "../dashboard/AddFixedCostModal";

interface EmptyFixedCostsStateProps {
  onFixedCostsUpdate?: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export const EmptyFixedCostsState = ({ onFixedCostsUpdate, hasFilters, onClearFilters }: EmptyFixedCostsStateProps) => {
  if (hasFilters) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-16 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Geen vaste kosten gevonden</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Er zijn geen vaste kosten die voldoen aan je huidige filters. 
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
            <div className="w-24 h-24 bg-gradient-to-r from-red-500/20 to-red-500/10 rounded-full flex items-center justify-center">
              <TrendingDown className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <div className="relative z-10 pt-12">
            <div className="w-3 h-3 bg-red-600 rounded-full mx-auto animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Voeg je eerste vaste kosten toe</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Begin met het toevoegen van je terugkerende uitgaven zoals abonnementen, 
          kantoorkosten, verzekeringen en meer om je cashflow beter te beheren.
        </p>
        
        <div className="space-y-4">
          <AddFixedCostModal onSuccess={onFixedCostsUpdate} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Automatische categorisering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Maandelijks overzicht</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Cashflow projecties</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};