import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Friendship, FriendStreak, UserPoints } from '@/types/social';
import { Users, UserPlus, MessageCircle, Flame, Check, X, Swords } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
}) => {
  const { user } = useAuth();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter leaderboard for potential friends (not already friends)
  const potentialFriends = leaderboard.filter(p => {
    if (p.user_id === user?.id) return false;
    const isFriend = friends.some(f => 
      f.requester_id === p.user_id || f.addressee_id === p.user_id
    );
    return !isFriend;
  });

  const filteredPotentialFriends = potentialFriends.filter(p =>
    p.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPotentialFriends.map((player) => (
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
                          {player.weekly_points} pts esta semana
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
                  {filteredPotentialFriends.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No se encontraron usuarios
                    </div>
                  )}
                </div>
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
                const requesterPoints = getFriendFromLeaderboard(request.requester_id);
                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={requesterPoints?.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {(requesterPoints?.profile?.name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {requesterPoints?.profile?.name || 'Usuario'}
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
            <p className="text-sm">¡Añade amigos de la liga!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friendship) => {
              const friendId = getFriendId(friendship);
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
                    <AvatarImage src={friendPoints?.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {(friendPoints?.profile?.name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {friendPoints?.profile?.name || 'Usuario'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{friendPoints?.weekly_points || 0} pts</span>
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
