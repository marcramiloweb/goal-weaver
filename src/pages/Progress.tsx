import React, { useMemo } from 'react';
import { useGoals, useStreak, useCheckIns } from '@/hooks/useGoals';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Flame, 
  Target, 
  CheckCircle, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { CATEGORY_CONFIG, GoalCategory } from '@/types/goals';
import { cn } from '@/lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export const Progress: React.FC = () => {
  const { goals, activeGoals, completedGoals } = useGoals();
  const { streak } = useStreak();
  const { checkIns } = useCheckIns();

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

        {/* Empty State */}
        {goals.length === 0 && (
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
