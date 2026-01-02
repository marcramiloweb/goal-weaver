import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { 
  GoalCategory, 
  GoalType, 
  GoalPriority,
  CATEGORY_CONFIG, 
  GOAL_TYPE_CONFIG,
  Goal 
} from '@/types/goals';
import { useGoals } from '@/hooks/useGoals';

interface EditGoalSheetProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditGoalSheet: React.FC<EditGoalSheetProps> = ({
  goal,
  open,
  onOpenChange,
}) => {
  const { updateGoal } = useGoals();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: goal.title,
    description: goal.description || '',
    category: goal.category,
    type: goal.type,
    priority: goal.priority,
    target_date: goal.target_date ? new Date(goal.target_date) : undefined,
    target_value: goal.target_value,
    current_value: goal.current_value,
    icon: goal.icon,
    why: goal.why || '',
  });

  useEffect(() => {
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      type: goal.type,
      priority: goal.priority,
      target_date: goal.target_date ? new Date(goal.target_date) : undefined,
      target_value: goal.target_value,
      current_value: goal.current_value,
      icon: goal.icon,
      why: goal.why || '',
    });
  }, [goal]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    setLoading(true);
    await updateGoal(goal.id, {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      priority: formData.priority,
      target_date: formData.target_date?.toISOString().split('T')[0],
      target_value: formData.target_value,
      current_value: formData.current_value,
      icon: formData.icon,
      why: formData.why,
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl flex items-center gap-2">
            <span className="text-3xl">{formData.icon}</span>
            Editar Meta
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 overflow-y-auto max-h-[calc(90vh-160px)] space-y-6">
          {/* Título e icono */}
          <div className="flex gap-3">
            <EmojiPicker 
              value={formData.icon} 
              onChange={(icon) => setFormData({ ...formData, icon })} 
            />
            <div className="flex-1">
              <Label className="text-base font-medium">Título</Label>
              <Input
                placeholder="Nombre de tu meta"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 h-12 text-lg"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label className="text-base font-medium">Descripción</Label>
            <Textarea
              placeholder="Más detalles sobre tu meta..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Categoría */}
          <div>
            <Label className="text-base font-medium">Categoría</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(Object.entries(CATEGORY_CONFIG) as [GoalCategory, typeof CATEGORY_CONFIG[GoalCategory]][]).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: key })}
                  className={cn(
                    'p-2 rounded-xl border-2 text-center text-sm transition-all',
                    formData.category === key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-lg mr-1">{config.icon}</span>
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <Label className="text-base font-medium">Tipo de meta</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(Object.entries(GOAL_TYPE_CONFIG) as [GoalType, typeof GOAL_TYPE_CONFIG[GoalType]][]).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: key })}
                  className={cn(
                    'p-2 rounded-xl border-2 text-center text-sm transition-all',
                    formData.type === key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-lg mr-1">{config.icon}</span>
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Valores - con opción de editar progreso actual */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Valor actual</Label>
              <Input
                type="number"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: Number(e.target.value) })}
                className="mt-1 h-12"
                min={0}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Corrige si marcaste de más
              </p>
            </div>
            <div>
              <Label className="text-base font-medium">Valor objetivo</Label>
              <Input
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: Number(e.target.value) })}
                className="mt-1 h-12"
                min={1}
              />
            </div>
          </div>

          {/* Fecha objetivo */}
          <div>
            <Label className="text-base font-medium">Fecha objetivo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-1 h-12',
                    !formData.target_date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.target_date ? (
                    format(formData.target_date, "PPP", { locale: es })
                  ) : (
                    <span>Sin fecha límite</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                <Calendar
                  mode="single"
                  selected={formData.target_date}
                  onSelect={(date) => setFormData({ ...formData, target_date: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Motivación */}
          <div>
            <Label className="text-base font-medium">¿Por qué es importante?</Label>
            <Textarea
              placeholder="Tu motivación..."
              value={formData.why}
              onChange={(e) => setFormData({ ...formData, why: e.target.value })}
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Prioridad */}
          <div>
            <Label className="text-base font-medium">Prioridad</Label>
            <div className="flex gap-2 mt-2">
              {(['low', 'medium', 'high'] as GoalPriority[]).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={cn(
                    'flex-1 py-3 rounded-xl border-2 font-medium transition-all',
                    formData.priority === priority
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {priority === 'low' ? 'Baja' : priority === 'medium' ? 'Media' : 'Alta'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={!formData.title.trim() || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
