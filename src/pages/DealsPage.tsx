import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AddDealModal } from "@/components/dashboard/AddDealModal";
import { DealStatistics } from "@/components/deals/DealStatistics";
import { DealCard } from "@/components/deals/DealCard";
import { DealFilters } from "@/components/deals/DealFilters";
import { EmptyDealsState } from "@/components/deals/EmptyDealsState";
import { DealsLoadingSkeleton } from "@/components/deals/DealsLoadingSkeleton";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/hooks/useAuth";

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
  created_at: string;
}

export const DealsPage = () => {
  const { user, signOut } = useAuth();
  const { deals, loading, refetch } = useDeals();
  
  // Filter and view states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleDealsUpdate = () => {
    refetch();
  };

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = [...(deals || [])];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Deal];
      let bValue = b[sortBy as keyof Deal];

      // Handle different data types
      if (sortBy === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortBy === 'expected_date' || sortBy === 'created_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [deals, searchTerm, statusFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  const hasActiveFilters = Boolean(searchTerm) || statusFilter !== "all";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DealsLoadingSkeleton viewMode={viewMode} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold font-manrope mb-2">
                Deal Management
              </h1>
              <p className="text-primary-foreground/90 text-lg">
                Beheer je sales pipeline en maximaliseer je omzet
              </p>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5" />
          </div>
        </div>

        {deals && deals.length > 0 ? (
          <>
            {/* Statistics */}
            <DealStatistics deals={deals} onDealsUpdate={handleDealsUpdate} />

            {/* Filters */}
            <DealFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalDeals={deals.length}
              filteredDeals={filteredAndSortedDeals.length}
            />

            {/* Deals Grid/List */}
            {filteredAndSortedDeals.length === 0 ? (
              <EmptyDealsState 
                hasFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                onDealsUpdate={handleDealsUpdate}
              />
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredAndSortedDeals.map((deal, index) => (
                  <div
                    key={deal.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <DealCard
                      deal={deal}
                      onDealsUpdate={handleDealsUpdate}
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyDealsState onDealsUpdate={handleDealsUpdate} />
        )}
      </main>
    </div>
  );
};