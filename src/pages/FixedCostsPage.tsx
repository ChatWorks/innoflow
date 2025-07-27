import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FixedCostsList } from "@/components/dashboard/FixedCostsList";
import { useAuth } from "@/hooks/useAuth";

export const FixedCostsPage = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-manrope text-foreground mb-2">
            Vaste Kosten
          </h2>
          <p className="text-muted-foreground">
            Beheer je terugkerende uitgaven en abonnementen
          </p>
        </div>

        <div className="space-y-6">
          <FixedCostsList />
        </div>
      </main>
    </div>
  );
};