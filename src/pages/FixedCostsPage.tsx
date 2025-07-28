import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AddFixedCostModal } from "@/components/dashboard/AddFixedCostModal";
import { FixedCostStatistics } from "@/components/fixed-costs/FixedCostStatistics";
import { FixedCostCard } from "@/components/fixed-costs/FixedCostCard";
import { FixedCostFilters } from "@/components/fixed-costs/FixedCostFilters";
import { EmptyFixedCostsState } from "@/components/fixed-costs/EmptyFixedCostsState";
import { FixedCostsLoadingSkeleton } from "@/components/fixed-costs/FixedCostsLoadingSkeleton";
import { VatToggle } from "@/components/ui/vat-toggle";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";

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

export const FixedCostsPage = () => {
  const { user, signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data, loading, refetch } = useDashboardData("month", currentDate);
  
  // Filter and view states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("start_date");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleFixedCostsUpdate = () => {
    refetch();
  };

  // Filter and sort fixed costs
  const filteredAndSortedFixedCosts = useMemo(() => {
    let filtered = [...(data.fixedCosts || [])];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cost =>
        cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cost.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(cost => cost.category === categoryFilter);
    }

    // Apply frequency filter
    if (frequencyFilter !== "all") {
      filtered = filtered.filter(cost => cost.frequency === frequencyFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof FixedCost];
      let bValue = b[sortBy as keyof FixedCost];

      // Handle different data types
      if (sortBy === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortBy === 'start_date') {
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
  }, [data.fixedCosts, searchTerm, categoryFilter, frequencyFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setFrequencyFilter("all");
    setSortBy("start_date");
    setSortOrder("desc");
  };

  const hasActiveFilters = Boolean(searchTerm) || categoryFilter !== "all" || frequencyFilter !== "all";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FixedCostsLoadingSkeleton viewMode={viewMode} />
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
            <div className="absolute inset-0 bg-primary/10" />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold font-manrope mb-2">
                  Vaste Kosten
                </h1>
                <p className="text-primary-foreground/90 text-lg">
                  Beheer je terugkerende uitgaven en abonnementen
                </p>
              </div>
              <VatToggle />
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5" />
          </div>
        </div>

        {data.fixedCosts && data.fixedCosts.length > 0 ? (
          <>
            {/* Statistics */}
            <FixedCostStatistics fixedCosts={data.fixedCosts} onFixedCostsUpdate={handleFixedCostsUpdate} />

            {/* Filters */}
            <FixedCostFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              frequencyFilter={frequencyFilter}
              onFrequencyFilterChange={setFrequencyFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalFixedCosts={data.fixedCosts.length}
              filteredFixedCosts={filteredAndSortedFixedCosts.length}
            />

            {/* Fixed Costs Grid/List */}
            {filteredAndSortedFixedCosts.length === 0 ? (
              <EmptyFixedCostsState 
                hasFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                onFixedCostsUpdate={handleFixedCostsUpdate}
              />
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredAndSortedFixedCosts.map((fixedCost, index) => (
                  <div
                    key={fixedCost.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <FixedCostCard
                      fixedCost={fixedCost}
                      onFixedCostsUpdate={handleFixedCostsUpdate}
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyFixedCostsState onFixedCostsUpdate={handleFixedCostsUpdate} />
        )}
      </main>
    </div>
  );
};