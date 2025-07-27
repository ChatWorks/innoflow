import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FixedCostsList } from "@/components/dashboard/FixedCostsList";
import { AddFixedCostModal } from "@/components/dashboard/AddFixedCostModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Plus, TrendingDown, Calculator, AlertCircle } from "lucide-react";

export const FixedCosts = () => {
  const { user, signOut } = useAuth();
  const { data: dashboardData } = useDashboardData("month", new Date());
  const [showAddCost, setShowAddCost] = useState(false);

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
              <h1 className="text-3xl font-bold text-foreground mb-2">Vaste Kosten</h1>
              <p className="text-muted-foreground">Beheer je maandelijkse en jaarlijkse uitgaven</p>
            </div>
            <button 
              onClick={() => setShowAddCost(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Kost
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maandelijkse Kosten</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData?.fixedCosts?.reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0) || 0)}</div>
              <p className="text-xs text-muted-foreground">Totaal per maand</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jaarlijkse Kosten</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency((dashboardData?.fixedCosts?.reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0) || 0) * 12)}</div>
              <p className="text-xs text-muted-foreground">Geschatte jaarkosten</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Kosten</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.fixedCosts?.filter(cost => cost.is_active)?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Lopende abonnementen</p>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Costs List */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Vaste Kosten</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FixedCostsList />
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">💡 Tips voor Kostenbeheer</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 dark:text-blue-200">
            <ul className="space-y-2 text-sm">
              <li>• Controleer maandelijks je abonnementen en zeg ongebruikte services op</li>
              <li>• Plan jaarlijkse betalingen voor kortingen waar mogelijk</li>
              <li>• Houd rekening met seizoensgebonden kosten in je budgettering</li>
              <li>• Monitor de cashflow impact van nieuwe vaste kosten</li>
            </ul>
          </CardContent>
        </Card>
      </main>
      
      <AddFixedCostModal onSuccess={() => setShowAddCost(false)} />
      
      {showAddCost && (
        <style>{`body { overflow: hidden; }`}</style>
      )}
    </div>
  );
};

export default FixedCosts;