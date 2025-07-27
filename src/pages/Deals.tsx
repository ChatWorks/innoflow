import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { AddDealModal } from "@/components/dashboard/AddDealModal";
import { EditDealModal } from "@/components/dashboard/EditDealModal";
import { FloatingActionButton } from "@/components/dashboard/FloatingActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Plus, TrendingUp, Euro, Calendar } from "lucide-react";

export const Deals = () => {
  const { user, signOut } = useAuth();
  const { data: dashboardData } = useDashboardData("month", new Date());
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onLogout={signOut} 
        userName={user?.email?.split('@')[0] || 'Team Member'} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Deals Overzicht</h1>
              <p className="text-muted-foreground">Beheer je deals en verkoop activiteiten</p>
            </div>
            <button 
              onClick={() => setShowAddDeal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Deal
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData?.deals?.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0) || 0)}</div>
              <p className="text-xs text-muted-foreground">Alle deals gecombineerd</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.deals?.length || 0}</div>
              <p className="text-xs text-muted-foreground">In behandeling en afgesloten</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deze Maand</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData?.deals?.filter(deal => {
                const date = new Date(deal.payment_received_date || deal.expected_date);
                return date.getMonth() === new Date().getMonth();
              }).reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0) || 0)}</div>
              <p className="text-xs text-muted-foreground">Omzet van deze maand</p>
            </CardContent>
          </Card>
        </div>

        {/* Deals List */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Deals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RecentDeals deals={dashboardData?.deals || []} onEditDeal={setEditingDeal} />
          </CardContent>
        </Card>
      </main>

      <FloatingActionButton onQuickDeal={() => setShowAddDeal(true)} />
      
      <AddDealModal onSuccess={() => setShowAddDeal(false)} />
      
      {showAddDeal && (
        <style>{`body { overflow: hidden; }`}</style>
      )}
      
      {editingDeal && (
        <EditDealModal
          deal={editingDeal}
          open={!!editingDeal}
          onOpenChange={(open) => !open && setEditingDeal(null)}
        />
      )}
    </div>
  );
};

export default Deals;