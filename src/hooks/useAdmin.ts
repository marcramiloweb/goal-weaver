import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!error && !!data);
      setLoading(false);
    };

    checkAdminRole();
  }, [user]);

  return { isAdmin, loading };
};

export const useAdminData = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [allGoals, setAllGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    // Fetch profiles with their stats
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profiles) {
      // Fetch goals count for each user
      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const { count: goalsCount } = await supabase
            .from('goals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          const { count: completedCount } = await supabase
            .from('goals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
            .eq('status', 'completed');

          return {
            ...profile,
            goals_count: goalsCount || 0,
            completed_count: completedCount || 0,
          };
        })
      );
      setUsers(usersWithStats);
    }
  };

  const fetchAllGoals = async () => {
    // Admin needs to use service role to bypass RLS - we'll fetch with available data
    const { data } = await supabase
      .from('goals')
      .select(`
        *,
        profiles:user_id (name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setAllGoals(data);
    }
  };

  const updateUser = async (userId: string, updates: { name?: string; bio?: string }) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (!error) await fetchUsers();
    return { error };
  };

  const updateGoal = async (goalId: string, updates: any) => {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId);
    
    if (!error) await fetchAllGoals();
    return { error };
  };

  const deleteUser = async (userId: string) => {
    // Delete all user data first
    await supabase.from('tasks').delete().eq('user_id', userId);
    await supabase.from('check_ins').delete().eq('user_id', userId);
    await supabase.from('goals').delete().eq('user_id', userId);
    await supabase.from('streaks').delete().eq('user_id', userId);
    await supabase.from('user_points').delete().eq('user_id', userId);
    await supabase.from('user_preferences').delete().eq('user_id', userId);
    await supabase.from('user_achievements').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    
    await fetchUsers();
  };

  const deleteGoal = async (goalId: string) => {
    await supabase.from('tasks').delete().eq('goal_id', goalId);
    await supabase.from('check_ins').delete().eq('goal_id', goalId);
    await supabase.from('goals').delete().eq('id', goalId);
    
    await fetchAllGoals();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchAllGoals()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return {
    users,
    allGoals,
    loading,
    deleteUser,
    deleteGoal,
    updateUser,
    updateGoal,
    refresh: () => Promise.all([fetchUsers(), fetchAllGoals()]),
  };
};
