import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoals, useTasks, useCheckIns, useStreak } from '@/hooks/useGoals';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProgressRing } from '@/components/ui/progress-ring';
import { TaskItem } from '@/components/goals/TaskItem';
import { EditGoalSheet } from '@/components/goals/EditGoalSheet';
import { Confetti } from '@/components/ui/confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Pause, 
  Play, 
  Trash2,
  Star,
  Edit,
  CalendarDays,
  Minus
} from 'lucide-react';
import { CATEGORY_CONFIG, GOAL_TYPE_CONFIG, Goal } from '@/types/goals';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const GoalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { goals, updateGoal, deleteGoal } = useGoals();
  const { tasks, createTask, toggleTask, deleteTask } = useTasks(id);
  const { checkIns, createCheckIn } = useCheckIns(id);
  const { updateStreak } = useStreak();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [checkInValue, setCheckInValue] = useState(1);

  useEffect(() => {
    const foundGoal = goals.find(g => g.id === id);
    if (foundGoal) {
      setGoal(foundGoal);
    }
  }, [goals, id]);

  if (!goal) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </AppLayout>
    );
  }

  const progress = goal.target_value > 0 
    ? (goal.current_value / goal.target_value) * 100 
    : 0;
  const categoryConfig = CATEGORY_CONFIG[goal.category];
  const typeConfig = GOAL_TYPE_CONFIG[goal.type];
  const daysRemaining = goal.target_date 
    ? differenceInDays(new Date(goal.target_date), new Date())
    : null;

  const handleCheckIn = async (subtract: boolean = false) => {
    const multiplier = subtract ? -1 : 1;
    const increment = goal.type === 'quantitative' ? checkInValue * multiplier : 
                      goal.type === 'habit' ? (100 / 30) * multiplier : 
                      (100 / 10) * multiplier;

    const newValue = Math.max(0, Math.min(goal.current_value + increment, goal.target_value));
    
    await updateGoal(goal.id, { current_value: newValue });
    if (!subtract) {
      await createCheckIn(goal.id, Math.abs(increment));
      await updateStreak();
    }

    if (newValue >= goal.target_value && goal.status !== 'completed' && !subtract) {
      setShowConfetti(true);
      await updateGoal(goal.id, { status: 'completed' });
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    await createTask({
      goal_id: goal.id,
      title: newTaskTitle,
      due_date: new Date().toISOString().split('T')[0],
    });
    
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const handleToggleStatus = async () => {
    const newStatus = goal.status === 'paused' ? 'active' : 'paused';
    await updateGoal(goal.id, { status: newStatus });
  };

  const handleDelete = async () => {
    await deleteGoal(goal.id);
    navigate('/goals');
  };

  const handleToggleFeatured = async () => {
    await updateGoal(goal.id, { is_featured: !goal.is_featured });
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;

  return (
    <AppLayout>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="pb-6">
        {/* Header */}
        <div 
          className="p-4 pt-12 pb-8"
          style={{ 
            background: `linear-gradient(135deg, ${goal.color}15 0%, transparent 100%)` 
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditSheet(true)}
              >
                <Edit className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFeatured}
              >
                <Star className={cn(
                  'h-5 w-5',
                  goal.is_featured ? 'fill-accent text-accent' : 'text-muted-foreground'
                )} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleStatus}
              >
                {goal.status === 'paused' ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-5xl">{goal.icon}</div>
            <div className="flex-1">
              <span className={cn('badge-category', `badge-${goal.category}`)}>
                {categoryConfig.icon} {categoryConfig.label}
              </span>
              <h1 className="text-2xl font-bold mt-2">{goal.title}</h1>
              {goal.description && (
                <p className="text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Progress Card */}
          <div className="card-elevated p-5">
            <div className="flex items-center gap-4 mb-4">
              <ProgressRing progress={progress} size={100} strokeWidth={10} />
              <div className="flex-1">
                <div className="text-3xl font-bold">
                  {Math.round(progress)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {typeConfig.icon} {typeConfig.label}
                </div>
                {goal.type === 'quantitative' && (
                  <div className="text-lg font-semibold mt-1">
                    {goal.current_value} / {goal.target_value}
                  </div>
                )}
                {daysRemaining !== null && daysRemaining > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <CalendarDays className="h-4 w-4" />
                    {daysRemaining} días restantes
                  </div>
                )}
              </div>
            </div>

            {goal.status === 'active' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {goal.type === 'quantitative' && (
                    <Input
                      type="number"
                      value={checkInValue}
                      onChange={(e) => setCheckInValue(Number(e.target.value))}
                      className="w-20"
                      min={1}
                    />
                  )}
                  <Button
                    className="flex-1"
                    onClick={() => handleCheckIn(false)}
                    disabled={progress >= 100}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {goal.type === 'quantitative' 
                      ? `Añadir ${checkInValue}` 
                      : 'Check-in de hoy'}
                  </Button>
                </div>
                {goal.current_value > 0 && (
                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleCheckIn(true)}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    {goal.type === 'quantitative' 
                      ? `Restar ${checkInValue}` 
                      : 'Deshacer check-in'}
                  </Button>
                )}
              </div>
            )}

            {goal.status === 'completed' && (
              <div className="text-center py-2 text-success font-medium">
                🎉 ¡Meta completada!
              </div>
            )}
          </div>

          {/* Why Section */}
          {goal.why && (
            <div className="card-glass p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                💭 Por qué es importante
              </h3>
              <p className="text-foreground">{goal.why}</p>
            </div>
          )}

          {/* Tasks Section */}
          {goal.type === 'checklist' && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-lg">
                  Tareas ({completedTasksCount}/{tasks.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir
                </Button>
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="card-glass p-6 text-center">
                  <p className="text-muted-foreground">
                    Añade tareas para desglosar esta meta
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Recent Check-ins */}
          {checkIns.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg mb-3">
                Historial de check-ins
              </h2>
              <div className="space-y-2">
                {checkIns.slice(0, 5).map((checkIn) => (
                  <div 
                    key={checkIn.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                  >
                    <span className="text-sm">
                      {format(new Date(checkIn.date), 'd MMM yyyy', { locale: es })}
                    </span>
                    <span className="text-sm font-medium text-success">
                      +{checkIn.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Add Task Sheet */}
      <Sheet open={showAddTask} onOpenChange={setShowAddTask}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Nueva tarea</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <Input
              placeholder="¿Qué necesitas hacer?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
            />
            <Button 
              className="w-full" 
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              Añadir tarea
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todas las tareas y registros asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Goal Sheet */}
      <EditGoalSheet 
        goal={goal} 
        open={showEditSheet} 
        onOpenChange={setShowEditSheet} 
      />
    </AppLayout>
  );
};

export default GoalDetail;
