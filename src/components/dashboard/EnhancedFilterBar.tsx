import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  X, 
  Filter,
  Clock,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date;
  to: Date;
};

export type FilterPreset = 
  | "this-week"
  | "last-30-days" 
  | "this-month"
  | "this-quarter"
  | "this-year"
  | "custom";

interface FilterBarProps {
  currentRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  currentPreset: FilterPreset;
  onPresetChange: (preset: FilterPreset) => void;
  className?: string;
}

const FILTER_PRESETS = [
  {
    id: "this-week" as FilterPreset,
    label: "Deze week",
    icon: Clock,
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 })
    })
  },
  {
    id: "last-30-days" as FilterPreset,
    label: "Laatste 30 dagen",
    icon: TrendingUp,
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date()
    })
  },
  {
    id: "this-month" as FilterPreset,
    label: "Deze maand",
    icon: Calendar,
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    id: "this-quarter" as FilterPreset,
    label: "Q4 2024",
    icon: BarChart3,
    getValue: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
      const quarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return {
        from: quarterStart,
        to: quarterEnd
      };
    }
  },
  {
    id: "this-year" as FilterPreset,
    label: "Dit jaar",
    icon: BarChart3,
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date())
    })
  }
];

export const EnhancedFilterBar = ({
  currentRange,
  onRangeChange,
  currentPreset,
  onPresetChange,
  className
}: FilterBarProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(currentRange);

  // Load saved filter from localStorage on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem('dashboard-filter');
    if (savedFilter) {
      try {
        const { preset, range } = JSON.parse(savedFilter);
        if (preset !== 'custom') {
          const presetConfig = FILTER_PRESETS.find(p => p.id === preset);
          if (presetConfig) {
            const newRange = presetConfig.getValue();
            onRangeChange(newRange);
            onPresetChange(preset);
          }
        } else if (range) {
          onRangeChange({
            from: new Date(range.from),
            to: new Date(range.to)
          });
          onPresetChange('custom');
        }
      } catch (error) {
        console.error('Error loading saved filter:', error);
      }
    }
  }, []);

  // Save filter to localStorage when it changes
  useEffect(() => {
    const filterData = {
      preset: currentPreset,
      range: currentPreset === 'custom' ? currentRange : null
    };
    localStorage.setItem('dashboard-filter', JSON.stringify(filterData));
  }, [currentPreset, currentRange]);

  const handlePresetClick = (preset: FilterPreset) => {
    const presetConfig = FILTER_PRESETS.find(p => p.id === preset);
    if (presetConfig) {
      const newRange = presetConfig.getValue();
      onRangeChange(newRange);
      onPresetChange(preset);
    }
  };

  const handleCustomRangeApply = () => {
    onRangeChange(tempRange);
    onPresetChange('custom');
    setIsCalendarOpen(false);
  };

  const clearCustomFilter = () => {
    // Reset to "this month" as default
    handlePresetClick('this-month');
  };

  const formatRangeLabel = () => {
    if (currentPreset !== 'custom') {
      const preset = FILTER_PRESETS.find(p => p.id === currentPreset);
      return preset?.label || '';
    }
    
    return `${format(currentRange.from, 'd MMM', { locale: nl })} - ${format(currentRange.to, 'd MMM yyyy', { locale: nl })}`;
  };

  return (
    <Card className={cn("sticky top-4 z-10 shadow-lg", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filter Presets */}
          <div className="flex flex-wrap gap-2">
            {FILTER_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.id}
                  variant={currentPreset === preset.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset.id)}
                  className="h-8 text-xs font-medium transition-all duration-200 hover:scale-105"
                >
                  <Icon className="h-3 w-3 mr-1.5" />
                  {preset.label}
                </Button>
              );
            })}

            {/* Custom Date Range */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={currentPreset === 'custom' ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs font-medium transition-all duration-200 hover:scale-105"
                >
                  <CalendarIcon className="h-3 w-3 mr-1.5" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-4">
                  <div className="text-sm font-medium">Selecteer datumbereik</div>
                  <Calendar
                    mode="range"
                    selected={{ from: tempRange.from, to: tempRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setTempRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      onClick={handleCustomRangeApply}
                      disabled={!tempRange.from || !tempRange.to}
                    >
                      Toepassen
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsCalendarOpen(false)}
                    >
                      Annuleren
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filter Display */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <Filter className="h-3 w-3" />
              {formatRangeLabel()}
              {currentPreset === 'custom' && (
                <button
                  onClick={clearCustomFilter}
                  className="ml-1 hover:bg-background rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};