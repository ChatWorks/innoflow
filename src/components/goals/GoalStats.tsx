import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { GoalStats as GoalStatsType } from '@/hooks/useGoals';

interface GoalStatsProps {
  stats: GoalStatsType;
}

export const GoalStats = ({ stats }: GoalStatsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.onTrack}</p>
              <p className="text-sm text-green-700">Op Schema</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.atRisk}</p>
              <p className="text-sm text-orange-700">Risico</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              <p className="text-sm text-blue-700">Voltooid</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={getScoreBg(stats.overallScore)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.overallScore >= 80 ? 'bg-green-100' : stats.overallScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <Target className={`h-5 w-5 ${getScoreColor(stats.overallScore)}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${getScoreColor(stats.overallScore)}`}>
                {stats.overallScore}%
              </p>
              <p className={`text-sm ${getScoreColor(stats.overallScore)}`}>
                Totaal Score
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};