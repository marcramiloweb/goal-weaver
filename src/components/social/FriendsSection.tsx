import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Friendship, FriendStreak, UserPoints } from '@/types/social';
import { Users, UserPlus, MessageCircle, Flame, Check, X, Swords, Search, Mail, AtSign, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface FriendProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface FriendsSectionProps {
  friends: Friendship[];
  pendingRequests: Friendship[];
  friendStreaks: FriendStreak[];
  leaderboard: UserPoints[];
  onSendRequest: (userId: string) => void;
  onRespondRequest: (friendshipId: string, accept: boolean) => void;
  onRemoveFriend: (friendshipId: string) => void;
  onOpenChat: (friendId: string) => void;
  onCreateChallenge: (friendId: string) => void;
  onSearchUsers?: (query: string) => Promise<{ id: string; name: string; email?: string; avatar_url?: string }[]>;
}

const FriendsSection: React.FC<FriendsSectionProps> = ({
  friends,
  pendingRequests,
  friendStreaks,
  leaderboard,
  onSendRequest,
  onRespondRequest,
  onRemoveFriend,
  onOpenChat,
  onCreateChallenge,
  onSearchUsers,
}) => {
  const { user } = useAuth();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email?: string; avatar_url?: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTab, setSearchTab] = useState<'search' | 'leaderboard'>('search');
  const [friendProfiles, setFriendProfiles] = useState<Map<string, FriendProfile>>(new Map());

  // Fetch friend profiles that are not in leaderboard
  useEffect(() => {
    const fetchMissingProfiles = async () => {
      if (!user) return;
      
      // Get all friend IDs
      const friendIds = friends.map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      
      // Add pending request requester IDs
      const pendingIds = pendingRequests.map(r => r.requester_id);
      const allIds = [...new Set([...friendIds, ...pendingIds])];
      
      // Filter out IDs that are already in leaderboard
      const leaderboardIds = new Set(leaderboard.map(l => l.user_id));
      const missingIds = allIds.filter(id => !leaderboardIds.has(id));
      
      if (missingIds.length === 0) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', missingIds);
        
      if (data) {
        const newMap = new Map(friendProfiles);
        data.forEach(p => newMap.set(p.id, p));
        setFriendProfiles(newMap);
      }
    };
    
    fetchMissingProfiles();
  }, [friends, pendingRequests, leaderboard, user]);

  // Debounced search
  useEffect(() => {
    if (!onSearchUsers || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await onSearchUsers(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchUsers]);

  const getFriendId = (friendship: Friendship) => {
    return friendship.requester_id === user?.id 
      ? friendship.addressee_id 
      : friendship.requester_id;
  };

  const getFriendStreak = (friendId: string) => {
    return friendStreaks.find(
      s => (s.user_id === user?.id && s.friend_id === friendId) ||
           (s.friend_id === user?.id && s.user_id === friendId)
    );
  };

  const getFriendFromLeaderboard = (friendId: string) => {
    return leaderboard.find(p => p.user_id === friendId);
  };

  // Get friend profile from leaderboard or fetched profiles
  const getFriendProfile = (friendId: string) => {
    const leaderboardEntry = getFriendFromLeaderboard(friendId);
    if (leaderboardEntry?.profile) {
      return leaderboardEntry.profile;
    }
    return friendProfiles.get(friendId) || null;
  };

  // Filter leaderboard for potential friends (not already friends)
  const potentialFriends = leaderboard.filter(p => {
    if (p.user_id === user?.id) return false;
    const isFriend = friends.some(f => 
      f.requester_id === p.user_id || f.addressee_id === p.user_id
    );
    return !isFriend;
  });
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Amigos ({friends.length})
          </CardTitle>
          <Sheet open={showAddFriend} onOpenChange={setShowAddFriend}>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="w-4 h-4 mr-1" />
                Añadir
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Añadir Amigos</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <Tabs value={searchTab} onValueChange={(v) => setSearchTab(v as 'search' | 'leaderboard')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="search" className="gap-1">
                      <Search className="w-4 h-4" />
                      Buscar
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="gap-1">
                      <Users className="w-4 h-4" />
                      Liga
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="mt-4 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o correo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Busca amigos por su nombre o correo electrónico
                    </p>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {isSearching && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      {!isSearching && searchQuery.length >= 2 && searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={result.avatar_url || undefined} />
                            <AvatarFallback>
                              {(result.name || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{result.name || 'Usuario'}</div>
                            {result.email && (
                              <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {result.email}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              onSendRequest(result.id);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>No se encontraron usuarios</p>
                          <p className="text-sm">Prueba con otro nombre o correo</p>
                        </div>
                      )}

                      {!isSearching && searchQuery.length < 2 && (
                        <div className="text-center text-muted-foreground py-8">
                          <AtSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>Escribe al menos 2 caracteres</p>
                          <p className="text-sm">para buscar usuarios</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="leaderboard" className="mt-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      Añade amigos de la tabla de clasificación
                    </p>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {potentialFriends.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={player.profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {(player.profile?.name || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{player.profile?.name || 'Usuario'}</div>
                            <div className="text-xs text-muted-foreground">
                              {player.total_points} pts totales
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              onSendRequest(player.user_id);
                              setShowAddFriend(false);
                            }}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {potentialFriends.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          No hay más usuarios en la liga
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pending requests */}
        <AnimatePresence>
          {pendingRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="text-sm font-medium text-orange-500 flex items-center gap-1">
                <Badge variant="destructive" className="text-xs">
                  {pendingRequests.length}
                </Badge>
                Solicitudes pendientes
              </div>
              {pendingRequests.map((request) => {
                const requesterProfile = getFriendProfile(request.requester_id);
                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={requesterProfile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {(requesterProfile?.name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {requesterProfile?.name || 'Usuario'}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-500"
                        onClick={() => onRespondRequest(request.id, true)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500"
                        onClick={() => onRespondRequest(request.id, false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Friends list */}
        {friends.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aún no tienes amigos</p>
            <p className="text-sm">¡Busca amigos por nombre o correo!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friendship) => {
              const friendId = getFriendId(friendship);
              const friendProfile = getFriendProfile(friendId);
              const friendPoints = getFriendFromLeaderboard(friendId);
              const streak = getFriendStreak(friendId);

              return (
                <motion.div
                  key={friendship.id}
                  className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={friendProfile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {(friendProfile?.name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {friendProfile?.name || 'Usuario'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{friendPoints?.total_points || 0} pts</span>
                      {streak && streak.current_streak > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Flame className="w-3 h-3 mr-1 text-orange-500" />
                          {streak.current_streak}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => onOpenChat(friendId)}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => onCreateChallenge(friendId)}
                    >
                      <Swords className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendsSection;