import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { AddDealModal } from "@/components/dashboard/AddDealModal";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const DealsPage = () => {
  const { user, signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data, loading, refetch } = useDashboardData("month", currentDate);

  const handleDealsUpdate = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Deals laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-manrope text-foreground mb-2">
            Deal Management
          </h2>
          <p className="text-muted-foreground">
            Beheer al je deals en bekijk je sales pipeline
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Alle Deals</h3>
            <AddDealModal onSuccess={handleDealsUpdate} />
          </div>
          <RecentDeals 
            deals={data.deals} 
            onDealsUpdate={handleDealsUpdate}
          />
        </div>
      </main>
    </div>
  );
};