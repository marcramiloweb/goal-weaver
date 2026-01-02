import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals, useTasks, useStreak, useCheckIns } from '@/hooks/useGoals';
import { useAchievements } from '@/hooks/useAchievements';
import { useSocial } from '@/hooks/useSocial';
import { AppLayout } from '@/components/layout/AppLayout';
import { GoalCard } from '@/components/goals/GoalCard';
import { TaskItem } from '@/components/goals/TaskItem';
import { CreateGoalSheet } from '@/components/goals/CreateGoalSheet';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Confetti } from '@/components/ui/confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GrowingTree from '@/components/social/GrowingTree';
import LeagueCard from '@/components/social/LeagueCard';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { Plus, Flame, Sparkles, ChevronRight, Trophy } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '@/types/goals';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { goals, activeGoals, featuredGoals, updateGoal } = useGoals();
  const { tasks, todayTasks, toggleTask } = useTasks();
  const { streak, updateStreak } = useStreak();
  const { createCheckIn } = useCheckIns();
  const { achievements } = useAchievements();
  const { userPoints, leaderboard, preferences, addPoints } = useSocial();

  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const today = new Date();
  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, [today]);

  const dailyQuote = useMemo(() => {
    const dayIndex = today.getDate() % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[dayIndex];
  }, [today]);

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

  // Calculate tree level based on achievements
  const earnedAchievements = achievements.filter(a => a.is_earned);
  const treeLevel = Math.min(1 + Math.floor(earnedAchievements.length / 2), 10);

  // How many achievements to show
  const achievementsToShow = preferences?.achievements_display_count || 3;

  const handleCheckIn = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const increment = goal.type === 'quantitative' ? 1 : 
                      goal.type === 'habit' ? (100 / 30) : // ~30 days
                      (100 / 10); // ~10 tasks default

    const newValue = Math.min(goal.current_value + increment, goal.target_value);
    
    await updateGoal(goalId, { current_value: newValue });
    await createCheckIn(goalId, increment);
    await updateStreak();
    
    // Add points for check-in
    await addPoints(10);

    if (newValue >= goal.target_value) {
      setShowConfetti(true);
      await updateGoal(goalId, { status: 'completed' });
      // Bonus points for completing goal
      await addPoints(50);
    }
  };

  const handleToggleFeatured = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      await updateGoal(goalId, { is_featured: !goal.is_featured });
    }
  };

  const completedTodayCount = todayTasks.filter(t => t.completed).length;

  return (
    <AppLayout>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="px-4 pt-12 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">
              {format(today, "EEEE, d 'de' MMMM", { locale: es })}
            </p>
            <h1 className="text-2xl font-bold mt-1">
              {greeting}, {profile?.name?.split(' ')[0] || 'campeón'} 👋
            </h1>
          </div>
          
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-full">
            <Flame className="h-4 w-4 text-accent" />
            <span className="font-semibold text-accent">{streak.current}</span>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="card-glass p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-accent flex-shrink-0" />
          <p className="text-sm text-foreground/80 italic">{dailyQuote}</p>
        </div>

        {/* Growing Tree Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <GrowingTree 
                level={treeLevel} 
                achievementsCount={earnedAchievements.length}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Tu Árbol de Logros</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Crece con cada meta que alcanzas
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Trophy className="w-3 h-3 mr-1" />
                    {earnedAchievements.length} logros
                  </Badge>
                  {treeLevel === 10 && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                      ¡Máximo nivel!
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress Card */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-4">
            <ProgressRing progress={overallProgress} size={80} strokeWidth={8} />
            <div className="flex-1">
              <h2 className="font-semibold text-lg">Tu progreso general</h2>
              <p className="text-sm text-muted-foreground">
                {activeGoals.length} {activeGoals.length === 1 ? 'meta activa' : 'metas activas'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-success">
                  ✓ {goals.filter(g => g.status === 'completed').length} completadas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* League Preview */}
        <LeagueCard
          userPoints={userPoints}
          leaderboard={leaderboard}
          onViewLeaderboard={() => navigate('/league')}
        />

        {/* Achievements Preview */}
        {achievements.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Logros ({earnedAchievements.length}/{achievements.length})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/achievements')}
                className="text-muted-foreground"
              >
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {achievements.slice(0, achievementsToShow).map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement}
                />
              ))}
            </div>
          </section>
        )}

        {/* Today's Tasks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">
              Hoy ({completedTodayCount}/{todayTasks.length})
            </h2>
          </div>

          {todayTasks.length > 0 ? (
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                />
              ))}
            </div>
          ) : (
            <div className="card-glass p-6 text-center">
              <p className="text-muted-foreground">No hay tareas para hoy</p>
              <Button
                variant="ghost"
                className="mt-2 text-primary"
                onClick={() => navigate('/goals')}
              >
                Ver todas las metas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </section>

        {/* Featured Goals */}
        {featuredGoals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">⭐ Metas destacadas</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/goals')}
                className="text-muted-foreground"
              >
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {featuredGoals.slice(0, 3).map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  compact
                  onClick={() => navigate(`/goals/${goal.id}`)}
                  onCheckIn={() => handleCheckIn(goal.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active Goals Preview */}
        {activeGoals.length > 0 && featuredGoals.length === 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Metas activas</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/goals')}
                className="text-muted-foreground"
              >
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {activeGoals.slice(0, 3).map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  compact
                  onClick={() => navigate(`/goals/${goal.id}`)}
                  onCheckIn={() => handleCheckIn(goal.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {activeGoals.length === 0 && (
          <div className="card-elevated p-8 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">¡Empieza tu viaje!</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera meta y comienza a construir el año que deseas.
            </p>
            <Button onClick={() => setShowCreateGoal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera meta
            </Button>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreateGoal(true)}
        className="fab flex items-center justify-center text-primary-foreground"
      >
        <Plus className="h-6 w-6" />
      </button>

      <CreateGoalSheet
        open={showCreateGoal}
        onOpenChange={setShowCreateGoal}
      />
    </AppLayout>
  );
};

export default Home;
