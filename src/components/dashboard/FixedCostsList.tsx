import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MoreHorizontal, Edit, Trash2, Euro } from "lucide-react";
import { AddFixedCostModal } from "./AddFixedCostModal";
import { EditFixedCostModal } from "./EditFixedCostModal";

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

export const FixedCostsList = () => {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFixedCosts();
  }, []);

  const fetchFixedCosts = async () => {
    try {
      const { data, error } = await supabase
        .from("fixed_costs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFixedCosts(data || []);
    } catch (error) {
      console.error("Error fetching fixed costs:", error);
      toast({
        title: "Fout",
        description: "Kon vaste kosten niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fixed_costs")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      setFixedCosts(prev => prev.filter(cost => cost.id !== id));
      toast({
        title: "Verwijderd",
        description: "Vaste kosten zijn verwijderd.",
      });
    } catch (error) {
      console.error("Error deleting fixed cost:", error);
      toast({
        title: "Fout",
        description: "Kon vaste kosten niet verwijderen.",
        variant: "destructive",
      });
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

  const getFrequencyText = (frequency: string) => {
    const frequencies = {
      monthly: "Maandelijks",
      quarterly: "Kwartaal",
      yearly: "Jaarlijks"
    };
    return frequencies[frequency as keyof typeof frequencies] || frequency;
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vaste Kosten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Vaste Kosten
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Totaal per maand: <span className="font-semibold text-foreground">{formatCurrency(calculateMonthlyTotal())}</span>
          </p>
        </div>
        <AddFixedCostModal onSuccess={fetchFixedCosts} />
      </CardHeader>
      <CardContent>
        {fixedCosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nog geen vaste kosten toegevoegd.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fixedCosts.map((cost) => (
              <div key={cost.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{cost.name}</h4>
                    <Badge variant="secondary">{cost.category}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{formatCurrency(cost.amount)} ({getFrequencyText(cost.frequency)})</span>
                    <span>Start: {new Date(cost.start_date).toLocaleDateString('nl-NL')}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <EditFixedCostModal fixedCost={cost} onSuccess={fetchFixedCosts} />
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(cost.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Verwijderen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};