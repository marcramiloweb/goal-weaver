import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPoints, LEAGUE_TIERS } from '@/types/social';
import { Trophy, ChevronRight, Crown, Medal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface LeagueCardProps {
  userPoints: UserPoints | null;
  leaderboard: UserPoints[];
  onViewLeaderboard: () => void;
}

const LeagueCard: React.FC<LeagueCardProps> = ({ userPoints, leaderboard, onViewLeaderboard }) => {
  const { user } = useAuth();
  const tier = userPoints ? LEAGUE_TIERS[userPoints.league_tier] : LEAGUE_TIERS.bronze;
  
  const userRank = leaderboard.findIndex(p => p.user_id === user?.id) + 1;
  const topThree = leaderboard.slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Liga Anual
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="text-sm"
            style={{ backgroundColor: tier.color + '20', color: tier.color }}
          >
            {tier.icon} {tier.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User's current standing */}
        {userPoints && (
          <motion.div 
            className="bg-primary/10 rounded-lg p-3 flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="text-2xl font-bold text-primary">
                {userPoints.weekly_points} pts
              </div>
              <div className="text-sm text-muted-foreground">
                Posición #{userRank || '—'} esta semana
              </div>
            </div>
            <div className="text-4xl">{tier.icon}</div>
          </motion.div>
        )}

        {/* Top 3 leaderboard preview */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Top 3</div>
          {topThree.map((player, index) => (
            <motion.div
              key={player.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                player.user_id === user?.id ? 'bg-primary/10' : 'bg-muted/50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-6 text-center">
                {index === 0 && <Crown className="w-5 h-5 text-yellow-500 mx-auto" />}
                {index === 1 && <Medal className="w-5 h-5 text-gray-400 mx-auto" />}
                {index === 2 && <Medal className="w-5 h-5 text-amber-600 mx-auto" />}
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src={player.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {(player.profile?.name || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {player.profile?.name || 'Usuario'}
                  {player.user_id === user?.id && ' (Tú)'}
                </div>
              </div>
              <div className="text-sm font-bold text-primary">
                {player.weekly_points} pts
              </div>
            </motion.div>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onViewLeaderboard}
        >
          Ver clasificación completa
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeagueCard;
