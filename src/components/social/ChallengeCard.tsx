import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Challenge, UserProfile } from '@/types/social';
import { Swords, Check, X, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface ChallengeCardProps {
  challenge: Challenge;
  creatorProfile?: UserProfile;
  opponentProfile?: UserProfile;
  onRespond?: (accept: boolean) => void;
  onUpdateProgress?: (progress: number) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  creatorProfile,
  opponentProfile,
  onRespond,
  onUpdateProgress,
}) => {
  const { user } = useAuth();
  const isCreator = challenge.creator_id === user?.id;
  const isPending = challenge.status === 'pending';
  const isActive = challenge.status === 'active';
  const isCompleted = challenge.status === 'completed';

  const myProgress = isCreator ? challenge.creator_progress : challenge.opponent_progress;
  const theirProgress = isCreator ? challenge.opponent_progress : challenge.creator_progress;
  const myProfile = isCreator ? creatorProfile : opponentProfile;
  const theirProfile = isCreator ? opponentProfile : creatorProfile;

  const myPercentage = (myProgress / challenge.target_value) * 100;
  const theirPercentage = (theirProgress / challenge.target_value) * 100;

  const amWinning = myProgress > theirProgress;
  const isWinner = challenge.winner_id === user?.id;

  const getStatusBadge = () => {
    if (isPending) return <Badge variant="secondary">Pendiente</Badge>;
    if (isActive) return <Badge className="bg-green-500">Activo</Badge>;
    if (isCompleted) {
      return isWinner 
        ? <Badge className="bg-yellow-500">¡Ganaste!</Badge>
        : <Badge variant="destructive">Perdiste</Badge>;
    }
    return <Badge variant="outline">Cancelado</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className={`overflow-hidden ${isActive && amWinning ? 'ring-2 ring-green-500/50' : ''}`}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{challenge.icon}</span>
              <div>
                <h4 className="font-semibold">{challenge.title}</h4>
                {challenge.description && (
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                )}
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* VS Section */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="font-medium text-sm truncate">
                {isCreator ? 'Tú' : creatorProfile?.name || 'Oponente'}
              </div>
              <div className="text-2xl font-bold text-primary">
                {challenge.creator_progress}
              </div>
              <Progress value={(challenge.creator_progress / challenge.target_value) * 100} className="h-2" />
            </div>

            <div className="flex flex-col items-center">
              <Swords className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">VS</span>
            </div>

            <div className="flex-1 text-center">
              <div className="font-medium text-sm truncate">
                {!isCreator ? 'Tú' : opponentProfile?.name || 'Oponente'}
              </div>
              <div className="text-2xl font-bold text-primary">
                {challenge.opponent_progress}
              </div>
              <Progress value={(challenge.opponent_progress / challenge.target_value) * 100} className="h-2" />
            </div>
          </div>

          {/* Target */}
          <div className="text-center text-sm text-muted-foreground">
            Meta: {challenge.target_value}
          </div>

          {/* Actions */}
          {isPending && !isCreator && onRespond && (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => onRespond(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Rechazar
              </Button>
              <Button
                className="flex-1"
                onClick={() => onRespond(true)}
              >
                <Check className="w-4 h-4 mr-1" />
                Aceptar
              </Button>
            </div>
          )}

          {isActive && onUpdateProgress && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onUpdateProgress(Math.max(0, myProgress - 1))}
                disabled={myProgress <= 0}
              >
                -1
              </Button>
              <Button
                className="flex-1"
                onClick={() => onUpdateProgress(myProgress + 1)}
                disabled={myProgress >= challenge.target_value}
              >
                +1
              </Button>
            </div>
          )}

          {isCompleted && isWinner && (
            <div className="flex items-center justify-center gap-2 text-yellow-500">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">¡Victoria!</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChallengeCard;
