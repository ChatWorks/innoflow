import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, addYears, subYears, addQuarters, subQuarters } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type TimePeriodType = "day" | "month" | "quarter" | "year";

interface TimeRangeSelectorProps {
  period: TimePeriodType;
  onPeriodChange: (period: TimePeriodType) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export const TimeRangeSelector = ({ 
  period, 
  onPeriodChange, 
  selectedDate, 
  onDateChange,
  className 
}: TimeRangeSelectorProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatSelectedDate = (date: Date, periodType: TimePeriodType) => {
    switch (periodType) {
      case "day":
        return format(date, "d MMMM yyyy", { locale: nl });
      case "month":
        return format(date, "MMMM yyyy", { locale: nl });
      case "quarter":
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case "year":
        return format(date, "yyyy", { locale: nl });
      default:
        return format(date, "MMMM yyyy", { locale: nl });
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    let newDate: Date;
    
    switch (period) {
      case "day":
        newDate = direction === "next" 
          ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
          : new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "month":
        newDate = direction === "next" 
          ? addMonths(selectedDate, 1) 
          : subMonths(selectedDate, 1);
        break;
      case "quarter":
        newDate = direction === "next" 
          ? addQuarters(selectedDate, 1) 
          : subQuarters(selectedDate, 1);
        break;
      case "year":
        newDate = direction === "next" 
          ? addYears(selectedDate, 1) 
          : subYears(selectedDate, 1);
        break;
      default:
        newDate = selectedDate;
    }
    
    onDateChange(newDate);
  };

  const periodOptions = [
    { value: "day", label: "Dag" },
    { value: "month", label: "Maand" },
    { value: "quarter", label: "Kwartaal" },
    { value: "year", label: "Jaar" }
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Period Type Selector */}
      <Select value={period} onValueChange={(value: TimePeriodType) => onPeriodChange(value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateDate("prev")}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatSelectedDate(selectedDate, period)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onDateChange(date);
                  setIsCalendarOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateDate("next")}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};