import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Friendship, Challenge, Message, UserPoints, UserPreferences, FriendStreak } from '@/types/social';
import { useToast } from '@/hooks/use-toast';

export const useSocial = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserPoints[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [friendStreaks, setFriendStreaks] = useState<FriendStreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAll();
      setupRealtimeMessages();
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchFriends(),
      fetchChallenges(),
      fetchLeaderboard(),
      fetchUserPoints(),
      fetchPreferences(),
      fetchFriendStreaks(),
    ]);
    setLoading(false);
  };

  const fetchFriends = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (!error && data) {
      const accepted = data.filter(f => f.status === 'accepted') as Friendship[];
      const pending = data.filter(f => f.status === 'pending' && f.addressee_id === user.id) as Friendship[];
      setFriends(accepted);
      setPendingRequests(pending);
    }
  };

  const fetchFriendStreaks = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('friend_streaks')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (!error && data) {
      setFriendStreaks(data as FriendStreak[]);
    }
  };

  const fetchChallenges = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setChallenges(data as Challenge[]);
    }
  };

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(50);

    if (!error && data) {
      // Fetch profiles for each user in leaderboard
      const userIds = data.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, email')
        .in('id', userIds);

      const leaderboardWithProfiles = data.map(item => ({
        ...item,
        profile: profiles?.find(p => p.id === item.user_id) || null,
      }));
      
      setLeaderboard(leaderboardWithProfiles as UserPoints[]);
    }
  };

  // Search users by name or email
  const searchUsers = async (query: string): Promise<{ id: string; name: string; email?: string; avatar_url?: string }[]> => {
    if (!query.trim() || query.length < 2) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, email')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);

    if (error || !data) return [];
    
    // Filter out current user and existing friends
    return data.filter(p => {
      if (p.id === user?.id) return false;
      const isFriend = friends.some(f => 
        f.requester_id === p.id || f.addressee_id === p.id
      );
      return !isFriend;
    });
  };

  const fetchUserPoints = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setUserPoints(data as UserPoints);
    } else if (!data) {
      // Create user points if not exists
      const { data: newData } = await supabase
        .from('user_points')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (newData) setUserPoints(newData as UserPoints);
    }
  };

  const fetchPreferences = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setPreferences(data as UserPreferences);
    } else if (!data) {
      // Create preferences if not exists
      const { data: newData } = await supabase
        .from('user_preferences')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (newData) setPreferences(newData as UserPreferences);
    }
  };

  const fetchMessages = async (friendId: string) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
      // Mark as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', friendId)
        .eq('receiver_id', user.id);
    }
  };

  const setupRealtimeMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          toast({
            title: 'Nuevo mensaje',
            description: 'Has recibido un nuevo mensaje',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendFriendRequest = async (email: string) => {
    if (!user) return { error: new Error('No user') };

    // Find user by email through profiles - we need to search differently
    const { data: profiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, name')
      .limit(100);

    if (searchError || !profiles) {
      return { error: new Error('No se pudo buscar usuarios') };
    }

    // For now, we'll need the user ID directly since we can't query auth.users
    // This is a limitation - in production you'd use an edge function
    toast({
      title: 'Funcionalidad limitada',
      description: 'Busca amigos por nombre de usuario en la liga',
      variant: 'destructive',
    });
    return { error: null };
  };

  const sendFriendRequestById = async (friendId: string) => {
    if (!user || friendId === user.id) return { error: new Error('Invalid request') };

    const { error } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: friendId,
        status: 'pending',
      });

    if (!error) {
      toast({ title: 'Solicitud enviada', description: 'Esperando respuesta' });
      await fetchFriends();
    }
    return { error };
  };

  const respondToRequest = async (friendshipId: string, accept: boolean) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', friendshipId);

    if (!error) {
      toast({
        title: accept ? 'Amigo añadido' : 'Solicitud rechazada',
      });
      await fetchFriends();
    }
    return { error };
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (!error) {
      await fetchFriends();
    }
    return { error };
  };

  const createChallenge = async (challenge: {
    opponent_id: string;
    title: string;
    description?: string;
    icon: string;
    target_value: number;
    end_date?: string;
  }) => {
    if (!user) return { error: new Error('No user') };

    const { error } = await supabase
      .from('challenges')
      .insert({
        creator_id: user.id,
        opponent_id: challenge.opponent_id,
        title: challenge.title,
        description: challenge.description,
        icon: challenge.icon,
        target_value: challenge.target_value,
        end_date: challenge.end_date,
      });

    if (!error) {
      toast({ title: 'Desafío creado', description: '¡Buena suerte!' });
      await fetchChallenges();
    }
    return { error };
  };

  const respondToChallenge = async (challengeId: string, accept: boolean) => {
    const { error } = await supabase
      .from('challenges')
      .update({ status: accept ? 'active' : 'cancelled' })
      .eq('id', challengeId);

    if (!error) {
      await fetchChallenges();
    }
    return { error };
  };

  const updateChallengeProgress = async (challengeId: string, progress: number) => {
    if (!user) return { error: new Error('No user') };

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return { error: new Error('Challenge not found') };

    const isCreator = challenge.creator_id === user.id;
    const updateField = isCreator ? 'creator_progress' : 'opponent_progress';
    const currentProgress = isCreator ? challenge.creator_progress : challenge.opponent_progress;

    // Calculate new progress values
    const newCreatorProgress = isCreator ? progress : challenge.creator_progress;
    const newOpponentProgress = isCreator ? challenge.opponent_progress : progress;

    const updates: Record<string, any> = { [updateField]: progress };
    
    // Check completion states - before and after
    const wasCompleted = currentProgress >= challenge.target_value;
    const isNowCompleted = progress >= challenge.target_value;
    
    // Check if BOTH players have reached the target - then the challenge is complete
    const creatorCompleted = newCreatorProgress >= challenge.target_value;
    const opponentCompleted = newOpponentProgress >= challenge.target_value;
    const wasFullyCompleted = challenge.status === 'completed';
    const isNowFullyCompleted = creatorCompleted && opponentCompleted;
    
    if (isNowFullyCompleted && !wasFullyCompleted) {
      // Both completed - challenge is done, both win!
      updates.status = 'completed';
      updates.winner_id = null; // null means both won
      toast({ title: '🎉 ¡Desafío completado!', description: '¡Ambos habéis ganado!' });
    } else if (isNowCompleted && !wasCompleted) {
      // Current user just completed their part
      toast({ title: '✅ ¡Meta alcanzada!', description: 'Esperando a que tu amigo complete su parte' });
    } else if (wasCompleted && !isNowCompleted) {
      // User "uncompleted" their part
      toast({ title: 'Progreso actualizado', description: 'Has desmarcado tu meta' });
    }

    const { error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', challengeId);

    if (!error) {
      await fetchChallenges();
      
      // Points logic: only change points when completion state changes
      if (!wasCompleted && isNowCompleted) {
        // Just completed my part - add 25 points
        await addPoints(25);
      } else if (wasCompleted && !isNowCompleted) {
        // Uncompleted my part - remove 25 points
        await addPoints(-25);
      }
      
      // Bonus for full challenge completion
      if (!wasFullyCompleted && isNowFullyCompleted) {
        await addPoints(25);
      } else if (wasFullyCompleted && !isNowFullyCompleted) {
        // Challenge was uncompleted - remove bonus
        await addPoints(-25);
      }
    }
    return { error };
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return { error: new Error('No user') };

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
      });

    if (!error) {
      await fetchMessages(receiverId);
      // Update friend streak
      await updateFriendStreak(receiverId);
    }
    return { error };
  };

  const updateFriendStreak = async (friendId: string) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const existing = friendStreaks.find(
      s => (s.user_id === user.id && s.friend_id === friendId)
    );

    if (existing) {
      const lastDate = existing.last_interaction_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let newStreak = existing.current_streak;
      if (lastDate === yesterday) {
        newStreak += 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }

      await supabase
        .from('friend_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, existing.longest_streak),
          last_interaction_date: today,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('friend_streaks')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          current_streak: 1,
          last_interaction_date: today,
        });
    }
    await fetchFriendStreaks();
  };

  const addPoints = async (points: number) => {
    if (!user || !userPoints) return { error: new Error('No user points') };

    const newTotal = Math.max(0, userPoints.total_points + points);
    const newWeekly = Math.max(0, userPoints.weekly_points + points);
    
    // Calculate new tier based on new total
    let newTier = 'bronze';
    if (newTotal >= 15000) newTier = 'master';
    else if (newTotal >= 5000) newTier = 'diamond';
    else if (newTotal >= 1500) newTier = 'platinum';
    else if (newTotal >= 500) newTier = 'gold';
    else if (newTotal >= 100) newTier = 'silver';

    const { error } = await supabase
      .from('user_points')
      .update({
        total_points: newTotal,
        weekly_points: newWeekly,
        league_tier: newTier,
      })
      .eq('user_id', user.id);

    if (!error) {
      await fetchUserPoints();
      await fetchLeaderboard();
    }
    return { error };
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return { error: new Error('No user') };

    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
    }
    return { error };
  };

  return {
    friends,
    pendingRequests,
    challenges,
    messages,
    leaderboard,
    userPoints,
    preferences,
    friendStreaks,
    loading,
    sendFriendRequest,
    sendFriendRequestById,
    searchUsers,
    respondToRequest,
    removeFriend,
    createChallenge,
    respondToChallenge,
    updateChallengeProgress,
    sendMessage,
    fetchMessages,
    addPoints,
    updatePreferences,
    refreshAll: fetchAll,
  };
};
