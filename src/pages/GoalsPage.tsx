import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, TrendingUp, Filter, BarChart3 } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useGoals, Goal } from '@/hooks/useGoals';
import { useAuth } from '@/hooks/useAuth';
import { GoalStats } from '@/components/goals/GoalStats';
import { GoalCard } from '@/components/goals/GoalCard';
import { CreateGoalModal } from '@/components/goals/CreateGoalModal';
import { Skeleton } from '@/components/ui/skeleton';

export const GoalsPage = () => {
  const { goals, loading, stats, createGoal, updateGoal, deleteGoal } = useGoals();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const filteredGoals = goals.filter(goal => {
    switch (activeTab) {
      case 'active': return goal.status === 'active';
      case 'completed': return goal.status === 'completed';
      case 'at-risk': {
        const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
        const daysToDeadline = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return goal.status === 'active' && (daysToDeadline < 7 && progress < 80);
      }
      default: return goal.status !== 'archived';
    }
  });

  const handleEditGoal = (goal: Goal) => {
    console.log('Edit goal:', goal);
  };

  const handleArchiveGoal = async (goalId: string) => {
    await updateGoal(goalId, { status: 'archived' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onLogout={signOut} userName={user?.email?.split("@")[0]} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
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
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold font-manrope mb-2 flex items-center gap-3">
                  <Target className="h-8 w-8" />
                  Doelen & Targets
                </h1>
                <p className="text-primary-foreground/90 text-lg">
                  Volg je voortgang en behaal je bedrijfsdoelstellingen
                </p>
              </div>
              <CreateGoalModal onCreateGoal={createGoal} />
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <GoalStats stats={stats} />
        </div>

        {goals.length > 0 ? (
          <>
            {/* Goals Section */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Jouw Doelstellingen
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {stats.atRisk > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {stats.atRisk} risico
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">
                      Alle ({goals.filter(g => g.status !== 'archived').length})
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      Actief ({goals.filter(g => g.status === 'active').length})
                    </TabsTrigger>
                    <TabsTrigger value="at-risk">
                      Risico ({stats.atRisk})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Voltooid ({stats.completed})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="space-y-6">
                    {filteredGoals.length === 0 ? (
                      <div className="text-center py-12">
                        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {activeTab === 'all' ? 'Geen doelen gevonden' : 
                           activeTab === 'active' ? 'Geen actieve doelen' :
                           activeTab === 'at-risk' ? 'Geen doelen met risico' :
                           'Geen voltooide doelen'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {activeTab === 'all' 
                            ? 'Begin met het aanmaken van je eerste doel'
                            : 'Start een nieuw doel om je voortgang te volgen'
                          }
                        </p>
                        {activeTab === 'all' && (
                          <CreateGoalModal onCreateGoal={createGoal} />
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredGoals.map((goal, index) => (
                          <div
                            key={goal.id}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className="animate-fade-in"
                          >
                            <GoalCard
                              goal={goal}
                              onEdit={handleEditGoal}
                              onDelete={deleteGoal}
                              onArchive={handleArchiveGoal}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Insights Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Doel Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Deze maand</h4>
                    <p className="text-sm text-muted-foreground">
                      Je hebt {stats.completed} doelen voltooid en {stats.onTrack} staan op schema.
                      {stats.atRisk > 0 && ` Let op ${stats.atRisk} doelen die aandacht nodig hebben.`}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Aanbeveling</h4>
                    <p className="text-sm text-muted-foreground">
                      {stats.overallScore >= 80 
                        ? 'Geweldig werk! Je bent op koers om je doelen te behalen.'
                        : stats.overallScore >= 60
                        ? 'Focus op de doelen met het hoogste risico voor maximale impact.'
                        : 'Overweeg je doelen aan te passen of extra acties te ondernemen.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-16">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">Welkom bij Doelen Management</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Begin met het stellen van je eerste bedrijfsdoel en volg automatisch je voortgang
            </p>
            <CreateGoalModal onCreateGoal={createGoal} />
          </div>
        )}
      </main>
    </div>
  );
};