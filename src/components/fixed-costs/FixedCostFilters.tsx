import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Grid, List, SortAsc, SortDesc } from "lucide-react";

interface FixedCostFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  frequencyFilter: string;
  onFrequencyFilterChange: (frequency: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalFixedCosts: number;
  filteredFixedCosts: number;
}

export const FixedCostFilters = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  frequencyFilter,
  onFrequencyFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  totalFixedCosts,
  filteredFixedCosts
}: FixedCostFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const categoryOptions = [
    { value: "all", label: "Alle categorieën" },
    { value: "software", label: "Software" },
    { value: "kantoor", label: "Kantoor" },
    { value: "marketing", label: "Marketing" },
    { value: "transport", label: "Transport" },
    { value: "utilities", label: "Utilities" },
    { value: "verzekeringen", label: "Verzekeringen" },
    { value: "overig", label: "Overig" }
  ];

  const frequencyOptions = [
    { value: "all", label: "Alle frequenties" },
    { value: "monthly", label: "Maandelijks" },
    { value: "quarterly", label: "Kwartaal" },
    { value: "yearly", label: "Jaarlijks" }
  ];

  const sortOptions = [
    { value: "amount", label: "Bedrag" },
    { value: "name", label: "Naam" },
    { value: "category", label: "Categorie" },
    { value: "frequency", label: "Frequentie" },
    { value: "start_date", label: "Startdatum" }
  ];

  const clearFilters = () => {
    onSearchChange("");
    onCategoryFilterChange("all");
    onFrequencyFilterChange("all");
    onSortChange("start_date");
    onSortOrderChange("desc");
  };

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || frequencyFilter !== "all";

  return (
    <Card className="mb-6 animate-fade-in">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Top row with search and primary actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Zoek vaste kosten, categorieën..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1 text-xs">
                    !
                  </Badge>
                )}
              </Button>

              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className="rounded-r-none border-r"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Expandable filters section */}
          {showFilters && (
            <div className="animate-fade-in border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Categorie</label>
                  <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Frequentie</label>
                  <Select value={frequencyFilter} onValueChange={onFrequencyFilterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sorteer op</label>
                  <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Volgorde</label>
                  <Button
                    variant="outline"
                    onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full justify-start"
                  >
                    {sortOrder === 'asc' ? (
                      <SortAsc className="h-4 w-4 mr-2" />
                    ) : (
                      <SortDesc className="h-4 w-4 mr-2" />
                    )}
                    {sortOrder === 'asc' ? 'Oplopend' : 'Aflopend'}
                  </Button>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Actieve filters:</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="gap-1">
                        Zoeken: {searchTerm}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => onSearchChange("")}
                        />
                      </Badge>
                    )}
                    {categoryFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Categorie: {categoryOptions.find(c => c.value === categoryFilter)?.label}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => onCategoryFilterChange("all")}
                        />
                      </Badge>
                    )}
                    {frequencyFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Frequentie: {frequencyOptions.find(f => f.value === frequencyFilter)?.label}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => onFrequencyFilterChange("all")}
                        />
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Alle filters wissen
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Results counter */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredFixedCosts} van {totalFixedCosts} vaste kosten
              {hasActiveFilters && " (gefilterd)"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};