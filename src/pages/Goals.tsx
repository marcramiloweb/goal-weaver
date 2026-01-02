import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoals, useCheckIns, useStreak } from '@/hooks/useGoals';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { GoalCard } from '@/components/goals/GoalCard';
import { CreateGoalSheet } from '@/components/goals/CreateGoalSheet';
import { Confetti } from '@/components/ui/confetti';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, Swords, Check, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CATEGORY_CONFIG, GoalCategory } from '@/types/goals';

export const Goals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goals, activeGoals, completedGoals, loading, updateGoal } = useGoals();
  const { createCheckIn } = useCheckIns();
  const { updateStreak } = useStreak();
  const { challenges, updateChallengeProgress, leaderboard } = useSocial();

  // Filter active challenges (not completed/cancelled)
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all');

  const handleCheckIn = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const increment = goal.type === 'quantitative' ? 1 : 
                      goal.type === 'habit' ? (100 / 30) : 
                      (100 / 10);

    const newValue = Math.min(goal.current_value + increment, goal.target_value);
    
    await updateGoal(goalId, { current_value: newValue });
    await createCheckIn(goalId, increment);
    await updateStreak();

    if (newValue >= goal.target_value) {
      setShowConfetti(true);
      await updateGoal(goalId, { status: 'completed' });
    }
  };

  const handleToggleFeatured = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      await updateGoal(goalId, { is_featured: !goal.is_featured });
    }
  };

  const filterGoals = (goalsList: typeof goals) => {
    return goalsList.filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || goal.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const pausedGoals = goals.filter(g => g.status === 'paused');

  return (
    <AppLayout>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="px-4 pt-12 pb-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Mis Metas 🎯</h1>
          <p className="text-muted-foreground">
            {activeGoals.length} activas · {completedGoals.length} completadas
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar metas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full flex-shrink-0"
            onClick={() => setSelectedCategory('all')}
          >
            Todas
          </Button>
          {(Object.entries(CATEGORY_CONFIG) as [GoalCategory, typeof CATEGORY_CONFIG[GoalCategory]][]).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              className="rounded-full flex-shrink-0"
              onClick={() => setSelectedCategory(key)}
            >
              {config.icon} {config.label}
            </Button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              Activas ({filterGoals(activeGoals).length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completadas ({filterGoals(completedGoals).length})
            </TabsTrigger>
            {pausedGoals.length > 0 && (
              <TabsTrigger value="paused" className="flex-1">
                Pausadas ({filterGoals(pausedGoals).length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-3">
            {/* Active Challenges Section */}
            {activeChallenges.length > 0 && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Swords className="h-4 w-4" />
                  Desafíos con amigos ({activeChallenges.length})
                </div>
                {activeChallenges.map((challenge) => {
                  const isCreator = challenge.creator_id === user?.id;
                  const myProgress = isCreator ? challenge.creator_progress : challenge.opponent_progress;
                  const theirProgress = isCreator ? challenge.opponent_progress : challenge.creator_progress;
                  const myCompleted = myProgress >= challenge.target_value;
                  const theirCompleted = theirProgress >= challenge.target_value;
                  const opponentId = isCreator ? challenge.opponent_id : challenge.creator_id;
                  const opponentProfile = leaderboard.find(l => l.user_id === opponentId)?.profile;
                  
                  return (
                    <Card key={challenge.id} className="card-elevated border-0 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{challenge.icon}</div>
                            <div>
                              <h3 className="font-semibold">{challenge.title}</h3>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                Con {opponentProfile?.name || 'amigo'}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Swords className="h-3 w-3" />
                            Desafío
                          </Badge>
                        </div>

                        {/* My Progress */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Tu progreso</span>
                            <span className="text-muted-foreground">
                              {myProgress}/{challenge.target_value}
                              {myCompleted && <Check className="inline h-4 w-4 ml-1 text-green-500" />}
                            </span>
                          </div>
                          <Progress value={(myProgress / challenge.target_value) * 100} className="h-2" />
                        </div>

                        {/* Their Progress */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{opponentProfile?.name || 'Amigo'}</span>
                            <span className="text-muted-foreground">
                              {theirProgress}/{challenge.target_value}
                              {theirCompleted && <Check className="inline h-4 w-4 ml-1 text-green-500" />}
                            </span>
                          </div>
                          <Progress value={(theirProgress / challenge.target_value) * 100} className="h-2 opacity-60" />
                        </div>

                        {/* Actions */}
                        {!myCompleted && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => updateChallengeProgress(challenge.id, Math.max(0, myProgress - 1))}
                              disabled={myProgress <= 0}
                            >
                              -1
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => updateChallengeProgress(challenge.id, myProgress + 1)}
                            >
                              +1
                            </Button>
                          </div>
                        )}
                        {myCompleted && !theirCompleted && (
                          <div className="text-center text-sm text-green-600 dark:text-green-400">
                            ✅ ¡Completado! Esperando a {opponentProfile?.name || 'tu amigo'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Regular Goals */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card-elevated h-32 animate-pulse bg-muted" />
                ))}
              </div>
            ) : filterGoals(activeGoals).length > 0 || activeChallenges.length > 0 ? (
              <div className="space-y-3 stagger-children">
                {filterGoals(activeGoals).map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onClick={() => navigate(`/goals/${goal.id}`)}
                    onCheckIn={() => handleCheckIn(goal.id)}
                    onToggleFeatured={() => handleToggleFeatured(goal.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">No hay metas activas</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'No se encontraron metas con estos filtros'
                    : 'Crea una meta para comenzar tu viaje'}
                </p>
                <Button onClick={() => setShowCreateGoal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva meta
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-3">
            {filterGoals(completedGoals).length > 0 ? (
              <div className="space-y-3">
                {filterGoals(completedGoals).map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onClick={() => navigate(`/goals/${goal.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 text-center">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold mb-2">Aún no hay metas completadas</h3>
                <p className="text-muted-foreground">
                  ¡Sigue trabajando en tus metas activas!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="paused" className="mt-4 space-y-3">
            {filterGoals(pausedGoals).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => navigate(`/goals/${goal.id}`)}
              />
            ))}
          </TabsContent>
        </Tabs>
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

export default Goals;
