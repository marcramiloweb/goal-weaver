import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoals, useCheckIns, useStreak } from '@/hooks/useGoals';
import { AppLayout } from '@/components/layout/AppLayout';
import { GoalCard } from '@/components/goals/GoalCard';
import { CreateGoalSheet } from '@/components/goals/CreateGoalSheet';
import { Confetti } from '@/components/ui/confetti';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CATEGORY_CONFIG, GoalCategory } from '@/types/goals';

export const Goals: React.FC = () => {
  const navigate = useNavigate();
  const { goals, activeGoals, completedGoals, loading, updateGoal } = useGoals();
  const { createCheckIn } = useCheckIns();
  const { updateStreak } = useStreak();

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
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card-elevated h-32 animate-pulse bg-muted" />
                ))}
              </div>
            ) : filterGoals(activeGoals).length > 0 ? (
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
