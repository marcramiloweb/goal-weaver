import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Target, CheckCircle2, Calendar } from 'lucide-react';
import { Goal, Task } from '@/types/goals';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProgressChartsProps {
  goals: Goal[];
  tasks: Task[];
  checkIns: Array<{ date: string; value: number; goal_id: string }>;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

const ProgressCharts: React.FC<ProgressChartsProps> = ({ goals, tasks, checkIns }) => {
  // Prepare weekly activity data
  const getWeeklyData = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: today });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayCheckIns = checkIns.filter(c => c.date === dateStr);
      const dayTasks = tasks.filter(t => 
        t.completed_at && format(new Date(t.completed_at), 'yyyy-MM-dd') === dateStr
      );

      return {
        day: format(day, 'EEE', { locale: es }),
        date: dateStr,
        checkIns: dayCheckIns.reduce((sum, c) => sum + (c.value || 1), 0),
        tasks: dayTasks.length,
      };
    });
  };

  // Prepare last 30 days trend
  const getMonthlyTrend = () => {
    const today = new Date();
    const data = [];

    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCheckIns = checkIns.filter(c => c.date === dateStr);
      
      data.push({
        date: format(date, 'd MMM', { locale: es }),
        progreso: dayCheckIns.reduce((sum, c) => sum + (c.value || 1), 0),
      });
    }

    return data;
  };

  // Goals by category
  const getGoalsByCategory = () => {
    const categoryCount: Record<string, number> = {};
    
    goals.forEach(goal => {
      const cat = goal.category || 'otro';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[index % COLORS.length],
    }));
  };

  // Goals progress distribution
  const getProgressDistribution = () => {
    const ranges = [
      { range: '0-25%', count: 0 },
      { range: '26-50%', count: 0 },
      { range: '51-75%', count: 0 },
      { range: '76-99%', count: 0 },
      { range: '100%', count: 0 },
    ];

    goals.forEach(goal => {
      const progress = ((goal.current_value || 0) / (goal.target_value || 1)) * 100;
      if (progress >= 100) ranges[4].count++;
      else if (progress >= 76) ranges[3].count++;
      else if (progress >= 51) ranges[2].count++;
      else if (progress >= 26) ranges[1].count++;
      else ranges[0].count++;
    });

    return ranges;
  };

  const weeklyData = getWeeklyData();
  const monthlyTrend = getMonthlyTrend();
  const categoryData = getGoalsByCategory();
  const progressData = getProgressDistribution();

  // Stats
  const totalCheckIns = checkIns.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + ((g.current_value || 0) / (g.target_value || 1)) * 100, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-blue-500" />
            <div className="text-2xl font-bold mt-1">{totalCheckIns}</div>
            <div className="text-xs text-muted-foreground">Check-ins totales</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto text-green-500" />
            <div className="text-2xl font-bold mt-1">{completedGoals}</div>
            <div className="text-xs text-muted-foreground">Metas completadas</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-purple-500" />
            <div className="text-2xl font-bold mt-1">{completedTasks}</div>
            <div className="text-xs text-muted-foreground">Tareas completadas</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-orange-500" />
            <div className="text-2xl font-bold mt-1">{avgProgress}%</div>
            <div className="text-xs text-muted-foreground">Progreso promedio</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly activity chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actividad Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="checkIns" name="Check-ins" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tasks" name="Tareas" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tendencia Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorProgreso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={10} interval={4} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="progreso"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorProgreso)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Goals by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Progress distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} layout="vertical">
                  <XAxis type="number" fontSize={10} />
                  <YAxis type="category" dataKey="range" fontSize={9} width={45} />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressCharts;
