import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Archive, 
  TrendingUp, 
  TrendingDown, 
  Target,
  CreditCard,
  UserCheck,
  Calendar,
  Euro
} from 'lucide-react';
import { Goal } from '@/hooks/useGoals';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onArchive: (goalId: string) => void;
}

const getGoalIcon = (type: Goal['goal_type']) => {
  switch (type) {
    case 'revenue_target': return TrendingUp;
    case 'expense_limit': return CreditCard;
    case 'mrr_growth': return Target;
    case 'deal_count': return UserCheck;
    default: return Target;
  }
};

const getStatusConfig = (goal: Goal) => {
  const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
  const daysToDeadline = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (goal.status === 'completed' || progress >= 100) {
    return { 
      status: 'Voltooid', 
      variant: 'default' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    };
  }
  
  if (daysToDeadline < 0) {
    return { 
      status: 'Verlopen', 
      variant: 'destructive' as const,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200'
    };
  }
  
  if (daysToDeadline < 7 && progress < 80) {
    return { 
      status: 'Risico', 
      variant: 'destructive' as const,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200'
    };
  }
  
  if (progress >= 50) {
    return { 
      status: 'Op Schema', 
      variant: 'default' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    };
  }
  
  return { 
    status: 'Achterstand', 
    variant: 'secondary' as const,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200'
  };
};

const formatValue = (value: number, type: Goal['goal_type']) => {
  if (type === 'deal_count') {
    return value.toString();
  }
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const GoalCard = ({ goal, onEdit, onDelete, onArchive }: GoalCardProps) => {
  const IconComponent = getGoalIcon(goal.goal_type);
  const progress = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0;
  const statusConfig = getStatusConfig(goal);
  const daysToDeadline = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${statusConfig.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">{goal.name}</h3>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
          </div>
          <Badge variant={statusConfig.variant} className="shrink-0">
            {statusConfig.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Voortgang</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Huidige waarde</span>
            <span className="font-semibold text-lg">
              {formatValue(goal.current_value, goal.goal_type)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Doel waarde</span>
            <span className="font-semibold text-lg">
              {formatValue(goal.target_value, goal.goal_type)}
            </span>
          </div>
        </div>

        {/* Deadline Info */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Deadline: {format(new Date(goal.deadline), 'dd MMM yyyy', { locale: nl })}
          </span>
          {daysToDeadline >= 0 && (
            <span className={`ml-auto font-medium ${statusConfig.color}`}>
              {daysToDeadline === 0 ? 'Vandaag!' : 
               daysToDeadline === 1 ? '1 dag' : 
               `${daysToDeadline} dagen`}
            </span>
          )}
        </div>

        {/* Progress Insight */}
        {goal.status === 'active' && (
          <div className="p-3 bg-white/80 rounded-lg border border-white/50">
            <div className="flex items-center gap-2 text-sm">
              {progress > 100 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {Math.round(progress - 100)}% boven doel!
                  </span>
                </>
              ) : progress >= 80 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Bijna daar! Nog {formatValue(goal.target_value - goal.current_value, goal.goal_type)} te gaan</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-600">Nog {formatValue(goal.target_value - goal.current_value, goal.goal_type)} nodig</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1 pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(goal)}
            className="h-8 px-2"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onArchive(goal.id)}
            className="h-8 px-2"
          >
            <Archive className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(goal.id)}
            className="h-8 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};