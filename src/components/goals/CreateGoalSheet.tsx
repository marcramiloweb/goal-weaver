import React, { useState } from 'react';
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
import { CalendarIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { 
  GoalCategory, 
  GoalType, 
  GoalPriority,
  CATEGORY_CONFIG, 
  GOAL_TYPE_CONFIG 
} from '@/types/goals';
import { useGoals } from '@/hooks/useGoals';

interface CreateGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGoalSheet: React.FC<CreateGoalSheetProps> = ({
  open,
  onOpenChange,
}) => {
  const { createGoal } = useGoals();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'otro' as GoalCategory,
    type: 'checklist' as GoalType,
    priority: 'medium' as GoalPriority,
    target_date: undefined as Date | undefined,
    target_value: 100,
    icon: '🎯',
    why: '',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    setLoading(true);
    await createGoal({
      ...formData,
      target_date: formData.target_date?.toISOString().split('T')[0],
    });
    setLoading(false);
    
    // Reset and close
    setFormData({
      title: '',
      description: '',
      category: 'otro',
      type: 'checklist',
      priority: 'medium',
      target_date: undefined,
      target_value: 100,
      icon: '🎯',
      why: '',
    });
    setStep(1);
    onOpenChange(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex gap-3 items-start">
              <div>
                <Label className="text-base font-medium mb-2 block">Icono</Label>
                <EmojiPicker 
                  value={formData.icon} 
                  onChange={(icon) => setFormData({ ...formData, icon })} 
                />
              </div>
              <div className="flex-1">
                <Label className="text-base font-medium">¿Cuál es tu meta?</Label>
                <Input
                  placeholder="Ej: Leer 12 libros este año"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-2 h-12 text-lg"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Descripción (opcional)</Label>
              <Textarea
                placeholder="Añade más detalles sobre tu meta..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 min-h-[100px]"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <Label className="text-base font-medium">Categoría</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(Object.entries(CATEGORY_CONFIG) as [GoalCategory, typeof CATEGORY_CONFIG[GoalCategory]][]).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: key })}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      formData.category === key
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <span className="text-xl mr-2">{config.icon}</span>
                    <span className="font-medium">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Tipo de meta</Label>
              <div className="space-y-2 mt-2">
                {(Object.entries(GOAL_TYPE_CONFIG) as [GoalType, typeof GOAL_TYPE_CONFIG[GoalType]][]).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: key })}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      formData.type === key
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <div className="font-medium">{config.label}</div>
                        <div className="text-sm text-muted-foreground">{config.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            {formData.type === 'quantitative' && (
              <div>
                <Label className="text-base font-medium">Valor objetivo</Label>
                <Input
                  type="number"
                  placeholder="Ej: 12"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: Number(e.target.value) })}
                  className="mt-2 h-12 text-lg"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  ¿Cuánto quieres lograr? (libros, km, €, etc.)
                </p>
              </div>
            )}

            <div>
              <Label className="text-base font-medium">Fecha objetivo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal mt-2 h-12',
                      !formData.target_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.target_date ? (
                      format(formData.target_date, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.target_date}
                    onSelect={(date) => setFormData({ ...formData, target_date: date })}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-base font-medium">¿Por qué es importante para ti?</Label>
              <Textarea
                placeholder="Escribir tu motivación te ayudará a mantener el enfoque..."
                value={formData.why}
                onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Prioridad</Label>
              <div className="flex gap-2 mt-2">
                {(['low', 'medium', 'high'] as GoalPriority[]).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={cn(
                      'flex-1 py-3 rounded-xl border-2 font-medium capitalize transition-all',
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
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl flex items-center gap-2">
            <span className="text-3xl">{formData.icon}</span>
            Nueva Meta
          </SheetTitle>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  s <= step ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </SheetHeader>

        <div className="mt-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStep()}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(step - 1)}
              >
                Atrás
              </Button>
            )}
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
              disabled={step === 1 && !formData.title.trim()}
            >
              {step < 3 ? (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : loading ? (
                'Creando...'
              ) : (
                '¡Crear Meta! 🎯'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
