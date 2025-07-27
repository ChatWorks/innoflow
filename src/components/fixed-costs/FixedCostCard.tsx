import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  Tag,
  Repeat
} from "lucide-react";
import { EditFixedCostModal } from "../dashboard/EditFixedCostModal";

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

interface FixedCostCardProps {
  fixedCost: FixedCost;
  onFixedCostsUpdate?: () => void;
  viewMode: 'grid' | 'list';
}

export const FixedCostCard = ({ fixedCost, onFixedCostsUpdate, viewMode }: FixedCostCardProps) => {
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getFrequencyConfig = (frequency: string) => {
    switch (frequency) {
      case "monthly":
        return {
          label: "Maandelijks",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Repeat
        };
      case "quarterly":
        return {
          label: "Kwartaal",
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: Calendar
        };
      case "yearly":
        return {
          label: "Jaarlijks",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: Clock
        };
      default:
        return {
          label: frequency,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Repeat
        };
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "software": "bg-blue-100 text-blue-800 border-blue-200",
      "kantoor": "bg-green-100 text-green-800 border-green-200",
      "marketing": "bg-purple-100 text-purple-800 border-purple-200",
      "transport": "bg-orange-100 text-orange-800 border-orange-200",
      "utilities": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "verzekeringen": "bg-red-100 text-red-800 border-red-200",
      "overig": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.overig;
  };

  const calculateMonthlyAmount = () => {
    let monthlyAmount = fixedCost.amount;
    if (fixedCost.frequency === "yearly") {
      monthlyAmount = fixedCost.amount / 12;
    } else if (fixedCost.frequency === "quarterly") {
      monthlyAmount = fixedCost.amount / 3;
    }
    return monthlyAmount;
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("fixed_costs")
        .update({ is_active: false })
        .eq("id", fixedCost.id);

      if (error) throw error;

      toast({
        title: "Verwijderd",
        description: "Vaste kosten zijn verwijderd.",
      });

      onFixedCostsUpdate?.();
    } catch (error) {
      console.error("Error deleting fixed cost:", error);
      toast({
        title: "Fout",
        description: "Kon vaste kosten niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  const frequencyConfig = getFrequencyConfig(fixedCost.frequency);
  const isExpiringSoon = fixedCost.end_date && new Date(fixedCost.end_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  if (viewMode === 'list') {
    return (
      <Card className="hover-scale animate-fade-in border-l-4 border-l-red-500/20 hover:border-l-red-500 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-lg truncate">{fixedCost.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{fixedCost.category}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-xl">{formatCurrency(fixedCost.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(calculateMonthlyAmount())}/maand
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`${getCategoryColor(fixedCost.category)} border`}>
                    <Tag className="h-3 w-3 mr-1" />
                    {fixedCost.category}
                  </Badge>
                  
                  <Badge className={`${frequencyConfig.color} border`}>
                    <frequencyConfig.icon className="h-3 w-3 mr-1" />
                    {frequencyConfig.label}
                  </Badge>
                  
                  {isExpiringSoon && (
                    <Badge variant="destructive" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Verloopt binnenkort
                    </Badge>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <EditFixedCostModal fixedCost={fixedCost} onSuccess={onFixedCostsUpdate} />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Verwijderen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {fixedCost.start_date && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>Start: {formatDate(fixedCost.start_date)}</span>
                  {fixedCost.end_date && (
                    <span className="ml-4">
                      Einde: {formatDate(fixedCost.end_date)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="group hover-scale animate-fade-in hover:shadow-lg transition-all duration-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-500/50" />
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {fixedCost.name}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground truncate">{fixedCost.category}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <EditFixedCostModal fixedCost={fixedCost} onSuccess={onFixedCostsUpdate} />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Verwijderen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <div className="text-center py-2">
              <p className="font-bold text-2xl">{formatCurrency(fixedCost.amount)}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(calculateMonthlyAmount())}/maand
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Badge className={`${getCategoryColor(fixedCost.category)} border text-xs`}>
                <Tag className="h-3 w-3 mr-1" />
                {fixedCost.category}
              </Badge>
              
              <Badge className={`${frequencyConfig.color} border text-xs`}>
                <frequencyConfig.icon className="h-3 w-3 mr-1" />
                {frequencyConfig.label}
              </Badge>
            </div>

            {isExpiringSoon && (
              <div className="text-center">
                <Badge variant="destructive" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Verloopt binnenkort
                </Badge>
              </div>
            )}

            {fixedCost.start_date && (
              <div className="text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Start: {formatDate(fixedCost.start_date)}</span>
                </div>
                {fixedCost.end_date && (
                  <div className="mt-1">
                    Einde: {formatDate(fixedCost.end_date)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};