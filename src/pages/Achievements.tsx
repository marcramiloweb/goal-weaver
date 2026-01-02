import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAchievements } from '@/hooks/useAchievements';
import { useGoals, useCheckIns, useStreak } from '@/hooks/useGoals';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { CreateAchievementSheet } from '@/components/achievements/CreateAchievementSheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trophy, Target, Sparkles } from 'lucide-react';

export const Achievements: React.FC = () => {
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  
  const { 
    achievements, 
    loading, 
    earnedAchievements, 
    pendingAchievements,
    deleteAchievement,
    syncAchievements 
  } = useAchievements();
  
  const { goals, completedGoals } = useGoals();
  const { checkIns } = useCheckIns();
  const { streak } = useStreak();

  // Calcular estadísticas para sincronizar logros
  const stats = useMemo(() => {
    const categoryGoals: Record<string, number> = {};
    
    completedGoals.forEach(goal => {
      categoryGoals[goal.category] = (categoryGoals[goal.category] || 0) + 1;
    });

    return {
      currentStreak: streak.current,
      goalsCompleted: completedGoals.length,
      totalCheckIns: checkIns.length,
      categoryGoals,
    };
  }, [streak, completedGoals, checkIns]);

  // Sincronizar logros cuando cambian las estadísticas
  useEffect(() => {
    if (achievements.length > 0 && !loading) {
      syncAchievements(stats);
    }
  }, [stats, achievements.length, loading]);

  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-7 w-7 text-accent" />
              Logros
            </h1>
            <p className="text-muted-foreground">
              Define tus metas y desbloquéalas
            </p>
          </div>
          <Button onClick={() => setShowCreateSheet(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-elevated p-4 text-center">
            <div className="text-2xl font-bold text-accent">{earnedAchievements.length}</div>
            <div className="text-xs text-muted-foreground">Conseguidos</div>
          </div>
          <div className="card-elevated p-4 text-center">
            <div className="text-2xl font-bold text-primary">{pendingAchievements.length}</div>
            <div className="text-xs text-muted-foreground">En progreso</div>
          </div>
          <div className="card-elevated p-4 text-center">
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {achievements.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Define tus logros
            </h3>
            <p className="text-muted-foreground mb-4">
              ¿Qué quieres conseguir? Crea logros personalizados para mantenerte motivado.
            </p>
            <Button onClick={() => setShowCreateSheet(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear mi primer logro
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="gap-2">
                <Target className="h-4 w-4" />
                En progreso ({pendingAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="earned" className="gap-2">
                <Trophy className="h-4 w-4" />
                Conseguidos ({earnedAchievements.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4 space-y-3">
              {pendingAchievements.length === 0 ? (
                <div className="card-glass p-6 text-center">
                  <p className="text-muted-foreground">
                    ¡Increíble! Has conseguido todos tus logros. 
                    <br />Añade nuevos retos para seguir mejorando.
                  </p>
                </div>
              ) : (
                pendingAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onDelete={() => deleteAchievement(achievement.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="earned" className="mt-4 space-y-3">
              {earnedAchievements.length === 0 ? (
                <div className="card-glass p-6 text-center">
                  <p className="text-muted-foreground">
                    Aún no has desbloqueado ningún logro. 
                    <br />¡Sigue trabajando en tus metas!
                  </p>
                </div>
              ) : (
                earnedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <CreateAchievementSheet 
        open={showCreateSheet} 
        onOpenChange={setShowCreateSheet} 
      />
    </AppLayout>
  );
};

export default Achievements;
