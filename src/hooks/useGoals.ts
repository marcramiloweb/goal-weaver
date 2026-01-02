import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Goal, Task, CheckIn, GoalCategory, GoalType, GoalPriority, GoalStatus } from '@/types/goals';
import { useToast } from '@/hooks/use-toast';
import { syncGoalsWidget, syncTasksWidget } from '@/utils/widgetSync';
export const useGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las metas',
        variant: 'destructive',
      });
    } else {
      setGoals((data || []) as Goal[]);
      // Sincronizar con widget de Android
      syncGoalsWidget(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (goalData: Partial<Goal>) => {
    if (!user) return { error: new Error('No user') };

    const { data, error } = await supabase
      .from('goals')
      .insert([{
        title: goalData.title || '',
        user_id: user.id,
        description: goalData.description,
        category: goalData.category,
        priority: goalData.priority,
        type: goalData.type,
        target_date: goalData.target_date,
        target_value: goalData.target_value,
        icon: goalData.icon,
        why: goalData.why,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la meta',
        variant: 'destructive',
      });
    } else {
      const newGoals = [data as Goal, ...goals];
      setGoals(newGoals);
      toast({
        title: '¡Meta creada! 🎯',
        description: 'Tu nueva meta está lista para conquistar',
      });
      // Sincronizar con widget de Android
      syncGoalsWidget(newGoals);
    }

    return { data: data as Goal | null, error };
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la meta',
        variant: 'destructive',
      });
    } else {
      const updatedGoals = goals.map(g => g.id === id ? data as Goal : g);
      setGoals(updatedGoals);
      // Sincronizar con widget de Android
      syncGoalsWidget(updatedGoals);
    }

    return { data: data as Goal | null, error };
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la meta',
        variant: 'destructive',
      });
    } else {
      const remainingGoals = goals.filter(g => g.id !== id);
      setGoals(remainingGoals);
      toast({
        title: 'Meta eliminada',
        description: 'La meta ha sido eliminada',
      });
      // Sincronizar con widget de Android
      syncGoalsWidget(remainingGoals);
    }

    return { error };
  };

  const completeGoal = async (id: string) => {
    return updateGoal(id, { 
      status: 'completed' as GoalStatus, 
      current_value: goals.find(g => g.id === id)?.target_value || 100 
    });
  };

  return {
    goals,
    loading,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    activeGoals: goals.filter(g => g.status === 'active'),
    completedGoals: goals.filter(g => g.status === 'completed'),
    featuredGoals: goals.filter(g => g.is_featured && g.status === 'active'),
  };
};

export const useTasks = (goalId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    if (goalId) {
      query = query.eq('goal_id', goalId);
    }

    const { data, error } = await query;

    if (!error) {
      setTasks((data || []) as Task[]);
      // Sincronizar con widget de Android
      syncTasksWidget(data || []);
    }
    setLoading(false);
  }, [user, goalId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData: Partial<Task>) => {
    if (!user) return { error: new Error('No user') };

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        goal_id: taskData.goal_id!,
        title: taskData.title || '',
        user_id: user.id,
        due_date: taskData.due_date,
      }])
      .select()
      .single();

    if (!error) {
      const newTasks = [...tasks, data as Task];
      setTasks(newTasks);
      // Sincronizar con widget de Android
      syncTasksWidget(newTasks);
    }

    return { data: data as Task | null, error };
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return { error: new Error('Task not found') };

    const completed = !task.completed;
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      const updatedTasks = tasks.map(t => t.id === id ? data as Task : t);
      setTasks(updatedTasks);
      // Sincronizar con widget de Android
      syncTasksWidget(updatedTasks);
    }

    return { data: data as Task | null, error };
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (!error) {
      const remainingTasks = tasks.filter(t => t.id !== id);
      setTasks(remainingTasks);
      // Sincronizar con widget de Android
      syncTasksWidget(remainingTasks);
    }

    return { error };
  };

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    toggleTask,
    deleteTask,
    todayTasks: tasks.filter(t => {
      if (!t.due_date) return false;
      const today = new Date().toISOString().split('T')[0];
      return t.due_date === today;
    }),
    completedTasks: tasks.filter(t => t.completed),
    pendingTasks: tasks.filter(t => !t.completed),
  };
};

export const useCheckIns = (goalId?: string) => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckIns = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    let query = supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (goalId) {
      query = query.eq('goal_id', goalId);
    }

    const { data, error } = await query;

    if (!error) {
      setCheckIns((data || []) as CheckIn[]);
    }
    setLoading(false);
  }, [user, goalId]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  const createCheckIn = async (goalId: string, value: number = 1, note?: string) => {
    if (!user) return { error: new Error('No user') };

    const { data, error } = await supabase
      .from('check_ins')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        value,
        note,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (!error) {
      setCheckIns(prev => [data as CheckIn, ...prev]);
    }

    return { data: data as CheckIn | null, error };
  };

  return {
    checkIns,
    loading,
    fetchCheckIns,
    createCheckIn,
    todayCheckIn: checkIns.find(c => c.date === new Date().toISOString().split('T')[0]),
  };
};

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      const { data } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setStreak({
          current: data.current_streak,
          longest: data.longest_streak,
        });
      }
    };

    fetchStreak();
  }, [user]);

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data: currentStreak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (currentStreak) {
      const lastDate = currentStreak.last_check_in_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = currentStreak.current_streak;
      
      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, currentStreak.longest_streak);

      await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_check_in_date: today,
        })
        .eq('user_id', user.id);

      setStreak({ current: newStreak, longest: longestStreak });
    }
  };

  return { streak, updateStreak };
};
