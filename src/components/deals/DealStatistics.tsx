import { TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Deal {
  id: string;
  title: string;
  client_name: string;
  amount: number;
  status: string;
  expected_date?: string;
  probability?: number;
}

interface DealStatisticsProps {
  deals: Deal[];
}

export const DealStatistics = ({ deals }: DealStatisticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const potentialDeals = deals.filter(deal => deal.status === 'potential').length;
  const confirmedValue = deals
    .filter(deal => deal.status === 'confirmed' || deal.status === 'invoiced')
    .reduce((sum, deal) => sum + deal.amount, 0);
  const paidValue = deals
    .filter(deal => deal.status === 'paid')
    .reduce((sum, deal) => sum + deal.amount, 0);

  const stats = [
    {
      title: "Totale Pipeline",
      value: formatCurrency(totalValue),
      icon: TrendingUp,
      description: `${deals.length} deals`,
      color: "bg-gradient-to-r from-primary/10 to-primary/5",
      iconColor: "text-primary"
    },
    {
      title: "Potentiële Deals",
      value: potentialDeals.toString(),
      icon: Clock,
      description: "Nog te bevestigen",
      color: "bg-gradient-to-r from-orange-500/10 to-orange-500/5",
      iconColor: "text-orange-600"
    },
    {
      title: "Bevestigde Waarde",
      value: formatCurrency(confirmedValue),
      icon: DollarSign,
      description: "Zekere inkomsten",
      color: "bg-gradient-to-r from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600"
    },
    {
      title: "Gerealiseerd",
      value: formatCurrency(paidValue),
      icon: CheckCircle,
      description: "Reeds ontvangen",
      color: "bg-gradient-to-r from-green-500/10 to-green-500/5",
      iconColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className={`${stat.color} border-0 hover-scale animate-fade-in`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};