import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Target, TrendingUp, CreditCard, UserCheck } from 'lucide-react';
import { Goal } from '@/hooks/useGoals';

interface CreateGoalModalProps {
  onCreateGoal: (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_value'>) => Promise<void>;
}

const goalTypeOptions = [
  { value: 'revenue_target', label: 'Revenue Target', icon: TrendingUp, description: 'Track monthly revenue goals' },
  { value: 'expense_limit', label: 'Expense Limit', icon: CreditCard, description: 'Set spending limits' },
  { value: 'mrr_growth', label: 'MRR Growth', icon: Target, description: 'Monitor recurring revenue' },
  { value: 'deal_count', label: 'Deal Count', icon: UserCheck, description: 'Target number of deals' },
  { value: 'custom', label: 'Custom Goal', icon: Target, description: 'Create a custom goal' }
];

export const CreateGoalModal = ({ onCreateGoal }: CreateGoalModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal_type: 'revenue_target' as Goal['goal_type'],
    target_value: '',
    deadline: '',
    category: 'general',
    status: 'active' as Goal['status'],
    is_automatic: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target_value || !formData.deadline) {
      return;
    }

    await onCreateGoal({
      name: formData.name,
      description: formData.description,
      goal_type: formData.goal_type,
      target_value: Number(formData.target_value),
      deadline: formData.deadline,
      category: formData.category,
      status: formData.status,
      is_automatic: formData.is_automatic
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      goal_type: 'revenue_target',
      target_value: '',
      deadline: '',
      category: 'general',
      status: 'active',
      is_automatic: true
    });
    
    setOpen(false);
  };

  const selectedGoalType = goalTypeOptions.find(option => option.value === formData.goal_type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nieuw Doel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nieuw Doel Aanmaken</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Type Section */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <Label className="text-sm font-medium">Doel Type *</Label>
            <Select value={formData.goal_type} onValueChange={(value) => setFormData(prev => ({ ...prev, goal_type: value as Goal['goal_type'] }))}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {goalTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="goal-name">Doel Naam *</Label>
              <Input
                id="goal-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Bijv. Maandelijkse omzet €10.000"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="goal-description">Beschrijving (optioneel)</Label>
              <Textarea
                id="goal-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Extra details over dit doel..."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          {/* Target and Deadline Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-value">
                Doel Waarde * {formData.goal_type === 'deal_count' ? ' (aantal)' : ' (€)'}
              </Label>
              <Input
                id="target-value"
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                placeholder={formData.goal_type === 'deal_count' ? '10' : '10000'}
                min="0"
                step={formData.goal_type === 'deal_count' ? '1' : '0.01'}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                required
                className="h-10"
              />
            </div>
          </div>

          {/* Category and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="general">📊 Algemeen</SelectItem>
                  <SelectItem value="sales">💰 Verkoop</SelectItem>
                  <SelectItem value="marketing">📈 Marketing</SelectItem>
                  <SelectItem value="operations">⚙️ Operationeel</SelectItem>
                  <SelectItem value="financial">💳 Financieel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Tracking</Label>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-1">
                  <Label htmlFor="automatic" className="text-sm font-medium">Automatische tracking</Label>
                  <p className="text-xs text-blue-600">
                    Voortgang wordt automatisch bijgewerkt
                  </p>
                </div>
                <Switch
                  id="automatic"
                  checked={formData.is_automatic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_automatic: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6">
              Annuleren
            </Button>
            <Button type="submit" className="px-6">
              Doel Aanmaken
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};