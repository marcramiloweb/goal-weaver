import React, { useState } from 'react';
import { Task } from '@/types/goals';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
}) => {
  const [celebrating, setCelebrating] = useState(false);

  const handleToggle = () => {
    if (!task.completed) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 300);
    }
    onToggle();
  };

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();
  const isToday = task.due_date === new Date().toISOString().split('T')[0];

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
        task.completed ? 'bg-muted/50' : 'bg-card hover:bg-muted/30',
        celebrating && 'scale-[1.02]'
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggle}
        className={cn(
          'h-6 w-6 rounded-full border-2',
          task.completed && 'bg-success border-success'
        )}
      />
      
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium transition-all',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>
        {task.due_date && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs mt-0.5',
              isOverdue ? 'text-destructive' : isToday ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <CalendarDays className="h-3 w-3" />
            {isToday ? 'Hoy' : format(new Date(task.due_date), 'd MMM', { locale: es })}
          </div>
        )}
      </div>

      {onDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
