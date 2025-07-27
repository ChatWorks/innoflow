import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export type TimePeriod = "day" | "week" | "month" | "quarter" | "year";

interface TimeFilterProps {
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  onDateChange: (date: Date) => void;
  currentDate: Date;
}

export const TimeFilter = ({ period, onPeriodChange, onDateChange, currentDate }: TimeFilterProps) => {
  const formatPeriodLabel = (date: Date, period: TimePeriod) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };

    switch (period) {
      case "day":
        return date.toLocaleDateString('nl-NL', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case "week":
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `Week ${getWeekNumber(date)} - ${startOfWeek.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })} t/m ${endOfWeek.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })}`;
      case "month":
        return date.toLocaleDateString('nl-NL', options);
      case "quarter":
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case "year":
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString('nl-NL', options);
    }
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (period) {
      case "day":
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case "week":
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case "quarter":
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case "year":
        newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Periode:</span>
      </div>
      
      <Select value={period} onValueChange={(value: TimePeriod) => onPeriodChange(value)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Dag</SelectItem>
          <SelectItem value="week">Week</SelectItem>
          <SelectItem value="month">Maand</SelectItem>
          <SelectItem value="quarter">Kwartaal</SelectItem>
          <SelectItem value="year">Jaar</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigatePeriod('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={goToToday}
          className="min-w-[200px] text-center"
        >
          {formatPeriodLabel(currentDate, period)}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigatePeriod('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};