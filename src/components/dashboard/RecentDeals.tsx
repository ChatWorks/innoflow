import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Deal {
  id: string;
  title: string;
  client_name: string;
  amount: number;
  status: "potential" | "confirmed" | "invoiced" | "paid";
  expected_date: string | null;
  probability: number;
}

interface RecentDealsProps {
  deals: Deal[];
  onViewDeal?: (dealId: string) => void;
  onEditDeal?: (dealId: string) => void;
}

export const RecentDeals = ({ deals, onViewDeal, onEditDeal }: RecentDealsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusVariant = (status: Deal["status"]) => {
    switch (status) {
      case "paid":
        return "default";
      case "confirmed":
      case "invoiced":
        return "secondary";
      case "potential":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: Deal["status"]) => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Geen datum";
    return new Intl.DateTimeFormat('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recente Deals</CardTitle>
        <Button variant="outline" size="sm">
          Alle Deals
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nog geen deals toegevoegd</p>
              <Button variant="outline" size="sm" className="mt-2">
                Deal Toevoegen
              </Button>
            </div>
          ) : (
            deals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground truncate">
                      {deal.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusVariant(deal.status)} className="text-xs">
                        {getStatusLabel(deal.status)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDeal?.(deal.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Bekijken
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditDeal?.(deal.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Bewerken
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{deal.client_name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-foreground">
                        {formatCurrency(deal.amount)}
                      </span>
                      {deal.status === "potential" && (
                        <span className="text-xs">
                          {deal.probability}% kans
                        </span>
                      )}
                      <span>{formatDate(deal.expected_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};