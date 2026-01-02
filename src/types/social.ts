export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
  requester_profile?: UserProfile;
  addressee_profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  banner_url?: string | null;
  bio?: string | null;
  tree_level?: number;
}

export interface FriendStreak {
  id: string;
  user_id: string;
  friend_id: string;
  current_streak: number;
  longest_streak: number;
  last_interaction_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  creator_id: string;
  opponent_id: string;
  title: string;
  description: string | null;
  icon: string;
  target_value: number;
  creator_progress: number;
  opponent_progress: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  winner_id: string | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  creator_profile?: UserProfile;
  opponent_profile?: UserProfile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: UserProfile;
}

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  weekly_points: number;
  league_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
  rank_position: number | null;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  achievements_display_count: number;
  notifications_enabled: boolean;
  notification_time: string;
  profile_visibility: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
}

export const LEAGUE_TIERS = {
  bronze: { name: 'Bronce', icon: '🥉', color: '#CD7F32', minPoints: 0 },
  silver: { name: 'Plata', icon: '🥈', color: '#C0C0C0', minPoints: 100 },
  gold: { name: 'Oro', icon: '🥇', color: '#FFD700', minPoints: 500 },
  platinum: { name: 'Platino', icon: '💎', color: '#E5E4E2', minPoints: 1500 },
  diamond: { name: 'Diamante', icon: '💠', color: '#B9F2FF', minPoints: 5000 },
  master: { name: 'Maestro', icon: '👑', color: '#9B59B6', minPoints: 15000 },
} as const;
