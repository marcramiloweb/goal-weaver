import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSocial } from '@/hooks/useSocial';
import { LEAGUE_TIERS } from '@/types/social';
import { Trophy, Crown, Medal, Flame, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FriendsSection from '@/components/social/FriendsSection';
import ChallengeCard from '@/components/social/ChallengeCard';
import ChatSheet from '@/components/social/ChatSheet';
import CreateChallengeSheet from '@/components/social/CreateChallengeSheet';
import { motion } from 'framer-motion';

const League: React.FC = () => {
  const { user } = useAuth();
  const {
    friends,
    pendingRequests,
    challenges,
    messages,
    leaderboard,
    userPoints,
    friendStreaks,
    loading,
    sendFriendRequestById,
    searchUsers,
    respondToRequest,
    removeFriend,
    createChallenge,
    respondToChallenge,
    updateChallengeProgress,
    sendMessage,
    fetchMessages,
  } = useSocial();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatFriendId, setChatFriendId] = useState('');
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeFriendId, setChallengeFriendId] = useState('');
  const [challengeFriendName, setChallengeFriendName] = useState('');

  const handleOpenChat = (friendId: string) => {
    setChatFriendId(friendId);
    setChatOpen(true);
  };

  const handleCreateChallenge = (friendId: string) => {
    const friend = leaderboard.find(p => p.user_id === friendId);
    setChallengeFriendId(friendId);
    setChallengeFriendName(friend?.profile?.name || 'Amigo');
    setChallengeOpen(true);
  };

  const getChatFriendProfile = () => {
    return leaderboard.find(p => p.user_id === chatFriendId)?.profile;
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>;
  };

  const activeChalllenges = challenges.filter(c => c.status === 'active' || c.status === 'pending');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <AppLayout>
      <div className="p-4 pb-24 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold">Liga & Social</h1>
            <p className="text-sm text-muted-foreground">
              Compite con amigos y sube de liga
            </p>
          </div>
        </div>

        <Tabs defaultValue="league" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="league">Liga</TabsTrigger>
            <TabsTrigger value="friends">Amigos</TabsTrigger>
            <TabsTrigger value="challenges">Desafíos</TabsTrigger>
          </TabsList>

          {/* League Tab */}
          <TabsContent value="league" className="space-y-4 mt-4">
            {/* User stats */}
            {userPoints && (
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Tu posición</div>
                      <div className="text-3xl font-bold">
                        #{leaderboard.findIndex(p => p.user_id === user?.id) + 1 || '—'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl">
                        {LEAGUE_TIERS[userPoints.league_tier].icon}
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: LEAGUE_TIERS[userPoints.league_tier].color + '20',
                          color: LEAGUE_TIERS[userPoints.league_tier].color 
                        }}
                      >
                        {LEAGUE_TIERS[userPoints.league_tier].name}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Puntos semanales</div>
                      <div className="text-3xl font-bold text-primary">
                        {userPoints.weekly_points}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Clasificación Semanal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {leaderboard.map((player, index) => {
                  const tier = LEAGUE_TIERS[player.league_tier];
                  const isCurrentUser = player.user_id === user?.id;
                  
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isCurrentUser ? 'bg-primary/10 ring-1 ring-primary' : 'bg-muted/50'
                      }`}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankIcon(index)}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={player.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(player.profile?.name || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate flex items-center gap-2">
                          {player.profile?.name || 'Usuario'}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">Tú</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span style={{ color: tier.color }}>{tier.icon}</span>
                          {tier.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{player.weekly_points}</div>
                        <div className="text-xs text-muted-foreground">pts</div>
                      </div>
                    </motion.div>
                  );
                })}

                {leaderboard.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay clasificación aún</p>
                    <p className="text-sm">¡Completa metas para ganar puntos!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="mt-4">
            <FriendsSection
              friends={friends}
              pendingRequests={pendingRequests}
              friendStreaks={friendStreaks}
              leaderboard={leaderboard}
              onSendRequest={sendFriendRequestById}
              onRespondRequest={respondToRequest}
              onRemoveFriend={removeFriend}
              onOpenChat={handleOpenChat}
              onCreateChallenge={handleCreateChallenge}
              onSearchUsers={searchUsers}
            />
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4 mt-4">
            {activeChalllenges.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Activos ({activeChalllenges.length})
                </h3>
                <div className="space-y-3">
                  {activeChalllenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      creatorProfile={leaderboard.find(p => p.user_id === challenge.creator_id)?.profile}
                      opponentProfile={leaderboard.find(p => p.user_id === challenge.opponent_id)?.profile}
                      onRespond={(accept) => respondToChallenge(challenge.id, accept)}
                      onUpdateProgress={(progress) => updateChallengeProgress(challenge.id, progress)}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedChallenges.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 text-muted-foreground">
                  Completados ({completedChallenges.length})
                </h3>
                <div className="space-y-3">
                  {completedChallenges.slice(0, 5).map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      creatorProfile={leaderboard.find(p => p.user_id === challenge.creator_id)?.profile}
                      opponentProfile={leaderboard.find(p => p.user_id === challenge.opponent_id)?.profile}
                    />
                  ))}
                </div>
              </div>
            )}

            {challenges.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes desafíos</p>
                  <p className="text-sm">¡Desafía a un amigo desde la pestaña Amigos!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Sheet */}
      <ChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        friendId={chatFriendId}
        friendProfile={getChatFriendProfile()}
        messages={messages}
        onSendMessage={(content) => sendMessage(chatFriendId, content)}
        onFetchMessages={fetchMessages}
      />

      {/* Create Challenge Sheet */}
      <CreateChallengeSheet
        open={challengeOpen}
        onOpenChange={setChallengeOpen}
        friendId={challengeFriendId}
        friendName={challengeFriendName}
        onCreateChallenge={createChallenge}
      />
    </AppLayout>
  );
};

export default League;
