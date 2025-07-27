import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Edit, MoreHorizontal, ArrowRight, Trash2 } from "lucide-react";
import { AddDealModal } from "./AddDealModal";
import { EditDealModal } from "./EditDealModal";

interface Deal {
  id: string;
  title: string;
  client_name: string;
  amount: number;
  status: string;
  expected_date?: string;
  probability?: number;
  invoice_date?: string;
  payment_due_date?: string;
  payment_received_date?: string;
}

interface RecentDealsProps {
  deals: Deal[];
  onViewDeal?: (deal: Deal) => void;
  onEditDeal?: (deal: Deal) => void;
  onDealsUpdate?: () => void;
}

export const RecentDeals = ({ deals, onViewDeal, onEditDeal, onDealsUpdate }: RecentDealsProps) => {
  const { toast } = useToast();
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "potential":
        return "secondary";
      case "confirmed":  
        return "default";
      case "invoiced":
        return "outline";
      case "paid":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "potential":
        return "Potentieel";
      case "confirmed":
        return "Bevestigd";
      case "invoiced":
        return "Gefactureerd";
      case "paid":
        return "Betaald";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "potential":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "invoiced":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "potential":
        return "confirmed";
      case "confirmed":
        return "invoiced";
      case "invoiced":
        return "paid";
      default:
        return null;
    }
  };

  const updateDealStatus = async (dealId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      // Set relevant dates based on status
      const now = new Date().toISOString().split('T')[0];
      if (newStatus === "invoiced") {
        updateData.invoice_date = now;
        // Set payment due date to 30 days from invoice
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        updateData.payment_due_date = dueDate.toISOString().split('T')[0];
      } else if (newStatus === "paid") {
        updateData.payment_received_date = now;
        
        // Create cashflow entry for paid deal
        const deal = deals.find(d => d.id === dealId);
        if (deal) {
          await createCashflowEntry(dealId, deal.amount, deal.title);
        }
      }

      const { error } = await supabase
        .from("deals")
        .update(updateData)
        .eq("id", dealId);

      if (error) throw error;

      toast({
        title: "Status bijgewerkt",
        description: `Deal status is gewijzigd naar ${getStatusLabel(newStatus)}.`,
      });

      onDealsUpdate?.();
    } catch (error) {
      console.error("Error updating deal status:", error);
      toast({
        title: "Fout",
        description: "Kon deal status niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const createCashflowEntry = async (dealId: string, amount: number, description: string) => {
    try {
      const { error } = await supabase
        .from("cashflow_entries")
        .insert({
          type: "income",
          description: `Deal betaling: ${description}`,
          category: "deals",
          amount: amount,
          transaction_date: new Date().toISOString().split('T')[0],
          deal_id: dealId,
          is_projected: false
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error creating cashflow entry:", error);
    }
  };

  const handleEditDeal = (deal: any) => {
    setEditingDeal(deal);
    setEditModalOpen(true);
  };

  const handleDeleteDeal = async (dealId: string) => {
    try {
      const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", dealId);

      if (error) throw error;

      toast({
        title: "Deal verwijderd",
        description: "De deal is succesvol verwijderd.",
      });

      onDealsUpdate?.();
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast({
        title: "Fout",
        description: "Kon deal niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recente Deals</CardTitle>
        <AddDealModal onSuccess={onDealsUpdate} />
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nog geen deals toegevoegd.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{deal.title}</h4>
                      <p className="text-sm text-muted-foreground">{deal.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(deal.amount)}</p>
                      {deal.expected_date && (
                        <p className="text-sm text-muted-foreground">
                          Verwacht: {formatDate(deal.expected_date)}
                        </p>
                      )}
                      {deal.payment_due_date && deal.status === "invoiced" && (
                        <p className="text-sm text-orange-600">
                          Vervaldatum: {formatDate(deal.payment_due_date)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${getStatusColor(deal.status)}`}
                      >
                        {getStatusLabel(deal.status)}
                      </span>
                      {getNextStatus(deal.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateDealStatus(deal.id, getNextStatus(deal.status)!)}
                          className="h-6 px-2 text-xs"
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          {getStatusLabel(getNextStatus(deal.status)!)}
                        </Button>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDeal?.(deal)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Bekijken
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditDeal(deal)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteDeal(deal.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <EditDealModal
        deal={editingDeal}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={onDealsUpdate}
      />
    </Card>
  );
};