import React, { useState } from 'react';
import { Goal, CATEGORY_CONFIG, GOAL_TYPE_CONFIG } from '@/types/goals';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Star, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface GoalCardProps {
  goal: Goal;
  onClick?: () => void;
  onCheckIn?: () => void;
  onToggleFeatured?: () => void;
  compact?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onClick,
  onCheckIn,
  onToggleFeatured,
  compact = false,
}) => {
  const [celebrating, setCelebrating] = useState(false);
  const progress = goal.target_value > 0 
    ? (goal.current_value / goal.target_value) * 100 
    : 0;
  const categoryConfig = CATEGORY_CONFIG[goal.category];
  const typeConfig = GOAL_TYPE_CONFIG[goal.type];
  
  const daysRemaining = goal.target_date 
    ? differenceInDays(new Date(goal.target_date), new Date())
    : null;

  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 500);
    onCheckIn?.();
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'card-elevated p-4 cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98]',
          celebrating && 'celebrate'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{goal.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{goal.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="progress-bar flex-1">
                <div 
                  className={cn(
                    'progress-bar-fill',
                    progress >= 100 && 'progress-bar-success'
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleCheckIn}
          >
            <Check className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'card-elevated p-5 cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.99]',
        celebrating && 'celebrate',
        goal.status === 'paused' && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{goal.icon}</div>
          <div>
            <span className={cn('badge-category', `badge-${goal.category}`)}>
              {categoryConfig.icon} {categoryConfig.label}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFeatured?.();
          }}
          className="p-1"
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              goal.is_featured 
                ? 'fill-accent text-accent' 
                : 'text-muted-foreground hover:text-accent'
            )}
          />
        </button>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1">{goal.title}</h3>
      {goal.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{goal.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ProgressRing progress={progress} size={56} strokeWidth={5} />
          <div>
            <div className="text-sm text-muted-foreground">
              {typeConfig.icon} {typeConfig.label}
            </div>
            {daysRemaining !== null && daysRemaining > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {daysRemaining} días restantes
              </div>
            )}
            {goal.type === 'quantitative' && (
              <div className="text-sm font-medium mt-1">
                {goal.current_value} / {goal.target_value}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {goal.status === 'paused' ? (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Pause className="h-4 w-4" />
              Pausada
            </div>
          ) : (
            <Button
              size="sm"
              className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleCheckIn}
            >
              <Check className="h-4 w-4 mr-1" />
              Check-in
            </Button>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};
