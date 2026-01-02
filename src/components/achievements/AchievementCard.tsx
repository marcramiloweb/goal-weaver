import React from 'react';
import { Achievement } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import { Trash2, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AchievementCardProps {
  achievement: Achievement;
  onDelete?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onDelete,
}) => {
  const progress = achievement.target_value > 0 
    ? (achievement.current_value / achievement.target_value) * 100 
    : 0;

  return (
    <div
      className={cn(
        'relative p-4 rounded-xl border-2 transition-all',
        achievement.is_earned 
          ? 'border-accent bg-accent/10' 
          : 'border-border bg-card'
      )}
    >
      {/* Delete button */}
      {onDelete && !achievement.is_earned && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-center gap-3">
        {/* Icon with status indicator */}
        <div className="relative">
          <span className={cn(
            'text-4xl',
            !achievement.is_earned && 'grayscale opacity-60'
          )}>
            {achievement.icon}
          </span>
          {achievement.is_earned ? (
            <div className="absolute -bottom-1 -right-1 bg-accent text-white rounded-full p-0.5">
              <CheckCircle className="h-4 w-4" />
            </div>
          ) : (
            <div className="absolute -bottom-1 -right-1 bg-muted text-muted-foreground rounded-full p-0.5">
              <Lock className="h-3 w-3" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-semibold truncate',
            !achievement.is_earned && 'text-muted-foreground'
          )}>
            {achievement.name}
          </h3>
          {achievement.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {achievement.description}
            </p>
          )}
          
          {/* Progress bar */}
          {!achievement.is_earned && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">
                  {achievement.current_value} / {achievement.target_value}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {achievement.is_earned && achievement.earned_at && (
            <p className="text-xs text-accent mt-1">
              ✨ Conseguido el {new Date(achievement.earned_at).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
