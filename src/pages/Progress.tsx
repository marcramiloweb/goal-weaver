import React, { useMemo } from 'react';
import { useGoals, useStreak, useCheckIns } from '@/hooks/useGoals';
import { useSocial } from '@/hooks/useSocial';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { 
  Flame, 
  Target, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Swords,
  Trophy,
  Users
} from 'lucide-react';
import { CATEGORY_CONFIG, GoalCategory } from '@/types/goals';
import { cn } from '@/lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

export const Progress: React.FC = () => {
  const { user } = useAuth();
  const { goals, activeGoals, completedGoals } = useGoals();
  const { streak } = useStreak();
  const { checkIns } = useCheckIns();
  const { challenges, leaderboard } = useSocial();

  const overallProgress = useMemo(() => {
    if (activeGoals.length === 0) return 0;
    const totalProgress = activeGoals.reduce((sum, goal) => {
      const progress = goal.target_value > 0 
        ? (goal.current_value / goal.target_value) * 100 
        : 0;
      return sum + Math.min(progress, 100);
    }, 0);
    return totalProgress / activeGoals.length;
  }, [activeGoals]);

  // Goals by category
  const categoryStats = useMemo(() => {
    const stats: Record<GoalCategory, { count: number; completed: number }> = {} as any;
    
    Object.keys(CATEGORY_CONFIG).forEach((key) => {
      stats[key as GoalCategory] = { count: 0, completed: 0 };
    });

    goals.forEach((goal) => {
      stats[goal.category].count++;
      if (goal.status === 'completed') {
        stats[goal.category].completed++;
      }
    });

    return Object.entries(stats)
      .filter(([_, val]) => val.count > 0)
      .map(([category, val]) => ({
        category: category as GoalCategory,
        ...val,
        config: CATEGORY_CONFIG[category as GoalCategory],
      }));
  }, [goals]);

  // Check-in trend for last 7 days
  const checkInTrend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCheckIns = checkIns.filter(c => c.date === dateStr);
      
      days.push({
        date: format(date, 'EEE', { locale: es }),
        fullDate: format(date, 'd MMM', { locale: es }),
        count: dayCheckIns.length,
        value: dayCheckIns.reduce((sum, c) => sum + c.value, 0),
      });
    }
    return days;
  }, [checkIns]);

  const totalCheckInsThisWeek = checkInTrend.reduce((sum, d) => sum + d.count, 0);

  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Tu Progreso 📊</h1>
          <p className="text-muted-foreground">
            Analiza tu avance y mantén el impulso
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-elevated border-0">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-accent mb-2">
                <Flame className="h-5 w-5" />
                <span className="text-2xl font-bold">{streak.current}</span>
              </div>
              <p className="text-sm text-muted-foreground">Racha actual</p>
              <p className="text-xs text-muted-foreground mt-1">
                Mejor: {streak.longest} días
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-success mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-2xl font-bold">{completedGoals.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Metas logradas</p>
              <p className="text-xs text-muted-foreground mt-1">
                de {goals.length} totales
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Target className="h-5 w-5" />
                <span className="text-2xl font-bold">{activeGoals.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Metas activas</p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Calendar className="h-5 w-5" />
                <span className="text-2xl font-bold">{totalCheckInsThisWeek}</span>
              </div>
              <p className="text-sm text-muted-foreground">Check-ins esta semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Progreso promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ProgressRing progress={overallProgress} size={80} strokeWidth={8} />
              <div>
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
                <p className="text-sm text-muted-foreground">
                  de tus metas activas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Trend Chart */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Actividad semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={checkInTrend}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    labelFormatter={(_, payload) => payload[0]?.payload?.fullDate}
                    formatter={(value: number) => [`${value} check-ins`, '']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
          <Card className="card-elevated border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Por categoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryStats.map(({ category, count, completed, config }) => (
                <div key={category} className="flex items-center gap-3">
                  <div className={cn('badge-category', `badge-${category}`)}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{config.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {completed}/{count}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={cn(
                          'progress-bar-fill',
                          completed === count && count > 0 && 'progress-bar-success'
                        )}
                        style={{ width: `${count > 0 ? (completed / count) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Friend Challenges Section */}
        {challenges.length > 0 && (
          <Card className="card-elevated border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Swords className="h-4 w-4 text-primary" />
                Desafíos con amigos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Challenge Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xl font-bold text-primary">
                    {challenges.filter(c => c.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Activos</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xl font-bold text-green-500">
                    {challenges.filter(c => c.status === 'completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completados</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xl font-bold text-amber-500">
                    {challenges.filter(c => {
                      const isCreator = c.creator_id === user?.id;
                      const myProgress = isCreator ? c.creator_progress : c.opponent_progress;
                      return c.status === 'active' && myProgress >= c.target_value;
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Tu parte lista</p>
                </div>
              </div>

              {/* Completion Chart */}
              {challenges.filter(c => c.status === 'completed').length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Desafíos completados juntos 🎉</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <Trophy className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {challenges.filter(c => c.status === 'completed').length}
                      </div>
                      <p className="text-xs text-muted-foreground">¡Desafíos superados en equipo!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Challenges */}
              {challenges.filter(c => c.status === 'active').length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Desafíos activos</p>
                  <div className="space-y-3">
                    {challenges
                      .filter(c => c.status === 'active')
                      .slice(0, 3)
                      .map((challenge) => {
                        const isCreator = challenge.creator_id === user?.id;
                        const myProgress = isCreator ? challenge.creator_progress : challenge.opponent_progress;
                        const theirProgress = isCreator ? challenge.opponent_progress : challenge.creator_progress;
                        const myPercentage = (myProgress / challenge.target_value) * 100;
                        const theirPercentage = (theirProgress / challenge.target_value) * 100;
                        const myCompleted = myProgress >= challenge.target_value;
                        const theirCompleted = theirProgress >= challenge.target_value;
                        
                        // Get opponent name from leaderboard
                        const opponentId = isCreator ? challenge.opponent_id : challenge.creator_id;
                        const opponentProfile = leaderboard.find(l => l.user_id === opponentId)?.profile;
                        
                        return (
                          <div 
                            key={challenge.id} 
                            className={cn(
                              "p-3 rounded-lg border",
                              myCompleted && theirCompleted 
                                ? "border-green-500/50 bg-green-500/10"
                                : myCompleted 
                                  ? "border-amber-500/30 bg-amber-500/5" 
                                  : "border-muted"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{challenge.icon}</span>
                                <span className="font-medium text-sm truncate max-w-[120px]">{challenge.title}</span>
                              </div>
                              {myCompleted ? (
                                <Badge className="bg-green-500 text-xs">✓ Tu parte</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">En progreso</Badge>
                              )}
                            </div>
                            
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs w-12 truncate">Tú</span>
                                <ProgressBar value={myPercentage} className="h-2 flex-1" />
                                <span className={cn("text-xs font-medium w-8 text-right", myCompleted && "text-green-500")}>
                                  {myCompleted ? '✓' : myProgress}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs w-12 truncate">{opponentProfile?.name || 'Amigo'}</span>
                                <ProgressBar value={theirPercentage} className="h-2 flex-1" />
                                <span className={cn("text-xs font-medium w-8 text-right", theirCompleted && "text-green-500")}>
                                  {theirCompleted ? '✓' : theirProgress}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground text-center mt-2">
                              Meta: {challenge.target_value} cada uno
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Recent Completions */}
              {challenges.filter(c => c.status === 'completed').length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Completados recientemente</p>
                  <div className="flex flex-wrap gap-2">
                    {challenges
                      .filter(c => c.status === 'completed')
                      .slice(0, 5)
                      .map((challenge) => (
                        <div
                          key={challenge.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                          <Trophy className="h-3 w-3" />
                          {challenge.icon}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {goals.length === 0 && challenges.length === 0 && (
          <div className="card-elevated p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Aún no hay datos</h3>
            <p className="text-muted-foreground">
              Crea metas y haz check-ins para ver tu progreso aquí.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Progress;
