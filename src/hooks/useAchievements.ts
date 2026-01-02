import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Points awarded per achievement
const POINTS_PER_ACHIEVEMENT = 50;

export interface Achievement {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon: string;
  target_type: 'streak' | 'goals_completed' | 'checkins' | 'category_goals';
  target_value: number;
  current_value: number;
  category?: string;
  is_earned: boolean;
  earned_at?: string;
  created_at: string;
  updated_at: string;
}

export const ACHIEVEMENT_TEMPLATES = [
  { 
    name: 'Primera racha de 7 días', 
    description: 'Mantener una racha de 7 días consecutivos',
    icon: '🔥', 
    target_type: 'streak' as const, 
    target_value: 7 
  },
  { 
    name: 'Racha de 30 días', 
    description: 'Mantener una racha de 30 días',
    icon: '🌟', 
    target_type: 'streak' as const, 
    target_value: 30 
  },
  { 
    name: 'Racha legendaria', 
    description: 'Mantener una racha de 100 días',
    icon: '👑', 
    target_type: 'streak' as const, 
    target_value: 100 
  },
  { 
    name: 'Primera meta completada', 
    description: 'Completar tu primera meta',
    icon: '🎯', 
    target_type: 'goals_completed' as const, 
    target_value: 1 
  },
  { 
    name: '5 metas completadas', 
    description: 'Completar 5 metas',
    icon: '🏆', 
    target_type: 'goals_completed' as const, 
    target_value: 5 
  },
  { 
    name: 'Conquistador de metas', 
    description: 'Completar 10 metas',
    icon: '💪', 
    target_type: 'goals_completed' as const, 
    target_value: 10 
  },
  { 
    name: 'Check-in maestro', 
    description: 'Realizar 50 check-ins',
    icon: '✅', 
    target_type: 'checkins' as const, 
    target_value: 50 
  },
  { 
    name: 'Constancia total', 
    description: 'Realizar 100 check-ins',
    icon: '💫', 
    target_type: 'checkins' as const, 
    target_value: 100 
  },
  { 
    name: 'Experto en salud', 
    description: 'Completar 3 metas de salud',
    icon: '💪', 
    target_type: 'category_goals' as const, 
    target_value: 3,
    category: 'salud'
  },
  { 
    name: 'Genio financiero', 
    description: 'Completar 3 metas de finanzas',
    icon: '💰', 
    target_type: 'category_goals' as const, 
    target_value: 3,
    category: 'finanzas'
  },
  { 
    name: 'Eterno estudiante', 
    description: 'Completar 3 metas de aprendizaje',
    icon: '📚', 
    target_type: 'category_goals' as const, 
    target_value: 3,
    category: 'aprendizaje'
  },
];

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAchievements(data as Achievement[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const createAchievement = async (achievementData: Partial<Achievement>) => {
    if (!user) return { error: new Error('No user') };

    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: user.id,
        name: achievementData.name || '',
        description: achievementData.description,
        icon: achievementData.icon || '🏆',
        target_type: achievementData.target_type || 'goals_completed',
        target_value: achievementData.target_value || 1,
        category: achievementData.category,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el logro',
        variant: 'destructive',
      });
    } else {
      setAchievements(prev => [data as Achievement, ...prev]);
      toast({
        title: '¡Logro añadido! 🎯',
        description: `"${achievementData.name}" está en tu lista`,
      });
    }

    return { data: data as Achievement | null, error };
  };

  const deleteAchievement = async (id: string) => {
    const { error } = await supabase
      .from('user_achievements')
      .delete()
      .eq('id', id);

    if (!error) {
      setAchievements(prev => prev.filter(a => a.id !== id));
    }

    return { error };
  };

  const updateAchievementProgress = async (
    id: string, 
    currentValue: number, 
    targetValue: number
  ) => {
    const isEarned = currentValue >= targetValue;
    
    const { data, error } = await supabase
      .from('user_achievements')
      .update({
        current_value: currentValue,
        is_earned: isEarned,
        earned_at: isEarned ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      setAchievements(prev => 
        prev.map(a => a.id === id ? data as Achievement : a)
      );

      if (isEarned) {
        // Award points for earning achievement
        await addPointsForAchievement();
        
        toast({
          title: '🎉 ¡Logro desbloqueado!',
          description: `Has conseguido "${(data as Achievement).name}" (+${POINTS_PER_ACHIEVEMENT} pts)`,
        });
      }
    }

    return { data: data as Achievement | null, error };
  };

  // Add points when earning an achievement
  const addPointsForAchievement = async () => {
    if (!user) return;

    // Get current points
    const { data: currentPoints } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (currentPoints) {
      const newTotal = currentPoints.total_points + POINTS_PER_ACHIEVEMENT;
      const newWeekly = currentPoints.weekly_points + POINTS_PER_ACHIEVEMENT;
      
      // Calculate new tier based on total points
      let newTier = currentPoints.league_tier;
      if (newTotal >= 15000) newTier = 'master';
      else if (newTotal >= 5000) newTier = 'diamond';
      else if (newTotal >= 1500) newTier = 'platinum';
      else if (newTotal >= 500) newTier = 'gold';
      else if (newTotal >= 100) newTier = 'silver';

      await supabase
        .from('user_points')
        .update({
          total_points: newTotal,
          weekly_points: newWeekly,
          league_tier: newTier,
        })
        .eq('user_id', user.id);
    } else {
      // Create user points if doesn't exist
      await supabase
        .from('user_points')
        .insert({
          user_id: user.id,
          total_points: POINTS_PER_ACHIEVEMENT,
          weekly_points: POINTS_PER_ACHIEVEMENT,
        });
    }
  };

  // Sincronizar logros con el progreso actual
  const syncAchievements = async (stats: {
    currentStreak: number;
    goalsCompleted: number;
    totalCheckIns: number;
    categoryGoals: Record<string, number>;
  }) => {
    for (const achievement of achievements) {
      if (achievement.is_earned) continue;

      let currentValue = 0;

      switch (achievement.target_type) {
        case 'streak':
          currentValue = stats.currentStreak;
          break;
        case 'goals_completed':
          currentValue = stats.goalsCompleted;
          break;
        case 'checkins':
          currentValue = stats.totalCheckIns;
          break;
        case 'category_goals':
          currentValue = achievement.category 
            ? (stats.categoryGoals[achievement.category] || 0)
            : 0;
          break;
      }

      if (currentValue !== achievement.current_value) {
        await updateAchievementProgress(
          achievement.id, 
          currentValue, 
          achievement.target_value
        );
      }
    }
  };

  return {
    achievements,
    loading,
    fetchAchievements,
    createAchievement,
    deleteAchievement,
    updateAchievementProgress,
    syncAchievements,
    earnedAchievements: achievements.filter(a => a.is_earned),
    pendingAchievements: achievements.filter(a => !a.is_earned),
  };
};
