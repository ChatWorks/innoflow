import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  Download, 
  RefreshCw, 
  MessageSquare,
  DollarSign,
  Receipt,
  BarChart3,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddDealModal } from "./AddDealModal";

interface FloatingAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface FloatingActionButtonProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onQuickDeal?: () => void;
  className?: string;
}

export const FloatingActionButton = ({
  onRefresh,
  onExport,
  onQuickDeal,
  className
}: FloatingActionButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickDeal, setShowQuickDeal] = useState(false);

  const actions: FloatingAction[] = [
    {
      id: 'quick-deal',
      label: 'Nieuwe Deal',
      icon: <DollarSign className="h-4 w-4" />,
      color: 'bg-success hover:bg-success/90',
      action: () => {
        setShowQuickDeal(true);
        setIsExpanded(false);
      }
    },
    {
      id: 'send-invoice',
      label: 'Factuur Versturen',
      icon: <FileText className="h-4 w-4" />,
      color: 'bg-primary hover:bg-primary/90',
      action: () => {
        // TODO: Implement invoice sending
        console.log('Send invoice');
        setIsExpanded(false);
      }
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: <Download className="h-4 w-4" />,
      color: 'bg-accent hover:bg-accent/90',
      action: () => {
        onExport?.();
        setIsExpanded(false);
      }
    },
    {
      id: 'refresh',
      label: 'Vernieuwen',
      icon: <RefreshCw className="h-4 w-4" />,
      color: 'bg-muted-foreground hover:bg-muted-foreground/90',
      action: () => {
        onRefresh?.();
        setIsExpanded(false);
      }
    }
  ];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3",
        className
      )}>
        {/* Action buttons */}
        <div className={cn(
          "flex flex-col items-end gap-2 transition-all duration-300",
          isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}>
          {actions.map((action, index) => (
            <div
              key={action.id}
              className={cn(
                "flex items-center gap-3 transition-all duration-300",
                isExpanded 
                  ? "translate-y-0 opacity-100" 
                  : "translate-y-4 opacity-0"
              )}
              style={{ 
                transitionDelay: isExpanded ? `${index * 50}ms` : '0ms' 
              }}
            >
              <Badge 
                variant="secondary" 
                className="px-3 py-1 shadow-md bg-background border"
              >
                {action.label}
              </Badge>
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg border-2 border-background/20",
                  "transition-all duration-200 hover:scale-110 active:scale-95",
                  action.color
                )}
                onClick={action.action}
              >
                {action.icon}
              </Button>
            </div>
          ))}
        </div>

        {/* Main FAB */}
        <Button
          size="icon"
          className={cn(
            "h-16 w-16 rounded-full shadow-xl border-4 border-background/20",
            "bg-primary hover:bg-primary/90 transition-all duration-300",
            "hover:scale-110 active:scale-95",
            isExpanded && "rotate-45"
          )}
          onClick={toggleExpanded}
        >
          {isExpanded ? (
            <X className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Plus className="h-6 w-6 text-primary-foreground" />
          )}
        </Button>

        {/* Backdrop */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-background/20 backdrop-blur-sm z-[-1]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>

      {/* Quick Deal Modal */}
      <AddDealModal 
        onSuccess={() => {
          setShowQuickDeal(false);
          onQuickDeal?.();
        }}
      />
    </>
  );
};