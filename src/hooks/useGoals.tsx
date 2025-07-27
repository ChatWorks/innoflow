import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal_type: 'revenue_target' | 'expense_limit' | 'mrr_growth' | 'deal_count' | 'custom';
  target_value: number;
  current_value: number;
  deadline: string;
  category: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  is_automatic: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalStats {
  onTrack: number;
  atRisk: number;
  completed: number;
  overallScore: number;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GoalStats>({
    onTrack: 0,
    atRisk: 0,
    completed: 0,
    overallScore: 0
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update current values for automatic goals
      const updatedGoals = await Promise.all((data || []).map(async (goal) => {
        const typedGoal = goal as Goal;
        if (typedGoal.is_automatic) {
          const currentValue = await calculateCurrentValue(typedGoal);
          return { ...typedGoal, current_value: currentValue };
        }
        return typedGoal;
      }));

      setGoals(updatedGoals);
      calculateStats(updatedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const calculateCurrentValue = async (goal: Goal): Promise<number> => {
    if (!user) return 0;

    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    try {
      switch (goal.goal_type) {
        case 'revenue_target': {
          // Sum of paid deals + cashflow income for current month
          const { data: deals } = await supabase
            .from('deals')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'paid')
            .gte('payment_received_date', monthStart.toISOString())
            .lte('payment_received_date', monthEnd.toISOString());

          const { data: cashflow } = await supabase
            .from('cashflow_entries')
            .select('amount')
            .eq('user_id', user.id)
            .eq('type', 'income')
            .gte('transaction_date', monthStart.toISOString())
            .lte('transaction_date', monthEnd.toISOString());

          const dealsTotal = deals?.reduce((sum, deal) => sum + Number(deal.amount), 0) || 0;
          const cashflowTotal = cashflow?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
          return dealsTotal + cashflowTotal;
        }

        case 'expense_limit': {
          // Sum of fixed costs + cashflow expenses for current month
          const { data: fixedCosts } = await supabase
            .from('fixed_costs')
            .select('amount')
            .eq('user_id', user.id)
            .eq('is_active', true);

          const { data: cashflow } = await supabase
            .from('cashflow_entries')
            .select('amount')
            .eq('user_id', user.id)
            .eq('type', 'expense')
            .gte('transaction_date', monthStart.toISOString())
            .lte('transaction_date', monthEnd.toISOString());

          const fixedTotal = fixedCosts?.reduce((sum, cost) => sum + Number(cost.amount), 0) || 0;
          const variableTotal = cashflow?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
          return fixedTotal + variableTotal;
        }

        case 'mrr_growth': {
          // Sum of active recurring revenue
          const { data: recurringRevenue } = await supabase
            .from('recurring_revenue')
            .select('monthly_amount')
            .eq('user_id', user.id)
            .eq('is_active', true);

          return recurringRevenue?.reduce((sum, revenue) => sum + Number(revenue.monthly_amount), 0) || 0;
        }

        case 'deal_count': {
          // Count of deals in current month
          const { count } = await supabase
            .from('deals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString());

          return count || 0;
        }

        default:
          return goal.current_value;
      }
    } catch (error) {
      console.error('Error calculating current value:', error);
      return goal.current_value;
    }
  };

  const calculateStats = (goalsList: Goal[]) => {
    const activeGoals = goalsList.filter(g => g.status === 'active');
    const completedGoals = goalsList.filter(g => g.status === 'completed');
    
    let onTrack = 0;
    let atRisk = 0;
    let totalProgress = 0;

    activeGoals.forEach(goal => {
      const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
      const daysToDeadline = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      totalProgress += Math.min(progress, 100);

      if (progress >= 100) {
        onTrack++;
      } else if (daysToDeadline < 7 && progress < 80) {
        atRisk++;
      } else if (progress >= 50) {
        onTrack++;
      } else {
        atRisk++;
      }
    });

    const overallScore = activeGoals.length > 0 ? 
      Math.round(totalProgress / activeGoals.length) : 100;

    setStats({
      onTrack,
      atRisk,
      completed: completedGoals.length,
      overallScore
    });
  };

  const createGoal = async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_value'>): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .insert([{
          ...goalData,
          user_id: user.id,
          current_value: 0
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal created successfully",
      });

      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal updated successfully",
      });

      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });

      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    stats,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals
  };
};