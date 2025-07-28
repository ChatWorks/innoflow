import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useVat } from "@/contexts/VatContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Eye, 
  Edit, 
  MoreHorizontal, 
  ArrowRight, 
  Trash2, 
  Calendar,
  User,
  Target,
  TrendingUp
} from "lucide-react";
import { EditDealModal } from "../dashboard/EditDealModal";

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

interface DealCardProps {
  deal: Deal;
  onViewDeal?: (deal: Deal) => void;
  onDealsUpdate?: () => void;
  viewMode: 'grid' | 'list';
}

export const DealCard = ({ deal, onViewDeal, onDealsUpdate, viewMode }: DealCardProps) => {
  const { user } = useAuth();
  const { applyVat } = useVat();
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "potential":
        return {
          label: "Potentieel",
          variant: "secondary" as const,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Target
        };
      case "confirmed":
        return {
          label: "Bevestigd",
          variant: "default" as const,
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Calendar
        };
      case "invoiced":
        return {
          label: "Gefactureerd",
          variant: "outline" as const,
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: TrendingUp
        };
      case "paid":
        return {
          label: "Betaald",
          variant: "destructive" as const,
          color: "bg-green-100 text-green-800 border-green-200",
          icon: User
        };
      default:
        return {
          label: status,
          variant: "secondary" as const,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Target
        };
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
      
      const now = new Date().toISOString().split('T')[0];
      if (newStatus === "invoiced") {
        updateData.invoice_date = now;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        updateData.payment_due_date = dueDate.toISOString().split('T')[0];
      } else if (newStatus === "paid") {
        updateData.payment_received_date = now;
        
        if (user) {
          await supabase
            .from("cashflow_entries")
            .insert({
              type: "income",
              description: `Deal betaling: ${deal.title}`,
              category: "deals",
              amount: deal.amount,
              transaction_date: now,
              deal_id: dealId,
              is_projected: false,
              user_id: user.id
            });
        }
      }

      const { error } = await supabase
        .from("deals")
        .update(updateData)
        .eq("id", dealId);

      if (error) throw error;

      toast({
        title: "Status bijgewerkt",
        description: `Deal status is gewijzigd naar ${getStatusConfig(newStatus).label}.`,
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

  const statusConfig = getStatusConfig(deal.status);
  const nextStatus = getNextStatus(deal.status);

  if (viewMode === 'list') {
    return (
      <Card className="hover-scale animate-fade-in border-l-4 border-l-primary/20 hover:border-l-primary transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-lg truncate">{deal.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{deal.client_name}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-xl">{formatCurrency(applyVat(deal.amount))}</p>
                  {deal.expected_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(deal.expected_date)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`${statusConfig.color} border`}>
                    <statusConfig.icon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  
                  {deal.probability && deal.status === 'potential' && (
                    <span className="text-sm text-muted-foreground">
                      {deal.probability}% kans
                    </span>
                  )}
                  
                  {nextStatus && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateDealStatus(deal.id, nextStatus)}
                      className="h-7 px-3 text-xs"
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      {getStatusConfig(nextStatus).label}
                    </Button>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onViewDeal?.(deal)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Bekijken
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
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
          
          <EditDealModal
            deal={deal}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSuccess={onDealsUpdate}
          />
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="group hover-scale animate-fade-in hover:shadow-lg transition-all duration-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {deal.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground truncate">{deal.client_name}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onViewDeal?.(deal)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Bekijken
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
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

            <div className="space-y-3">
            <div className="text-center py-2">
              <p className="font-bold text-2xl">{formatCurrency(applyVat(deal.amount))}</p>
            </div>

            <div className="flex items-center justify-center">
              <Badge className={`${statusConfig.color} border`}>
                <statusConfig.icon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>

            {deal.expected_date && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Verwacht: {formatDate(deal.expected_date)}</span>
              </div>
            )}

            {deal.probability && deal.status === 'potential' && (
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  {deal.probability}% kans op sluiting
                </span>
              </div>
            )}
          </div>

          {nextStatus && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateDealStatus(deal.id, nextStatus)}
              className="w-full mt-4"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Markeer als {getStatusConfig(nextStatus).label}
            </Button>
          )}
        </div>
      </CardContent>
      
      <EditDealModal
        deal={deal}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={onDealsUpdate}
      />
    </Card>
  );
};