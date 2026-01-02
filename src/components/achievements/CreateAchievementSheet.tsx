import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ACHIEVEMENT_TEMPLATES, useAchievements } from '@/hooks/useAchievements';
import { CATEGORY_CONFIG, GoalCategory } from '@/types/goals';
import { cn } from '@/lib/utils';
import { Sparkles, Plus } from 'lucide-react';

interface CreateAchievementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAchievementSheet: React.FC<CreateAchievementSheetProps> = ({
  open,
  onOpenChange,
}) => {
  const { createAchievement } = useAchievements();
  const [mode, setMode] = useState<'templates' | 'custom'>('templates');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    target_type: 'goals_completed' as 'streak' | 'goals_completed' | 'checkins' | 'category_goals',
    target_value: 1,
    category: undefined as string | undefined,
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    setLoading(true);
    await createAchievement(formData);
    setLoading(false);
    
    setFormData({
      name: '',
      description: '',
      icon: '🏆',
      target_type: 'goals_completed',
      target_value: 1,
      category: undefined,
    });
    onOpenChange(false);
  };

  const handleSelectTemplate = async (template: typeof ACHIEVEMENT_TEMPLATES[0]) => {
    setLoading(true);
    await createAchievement({
      name: template.name,
      description: template.description,
      icon: template.icon,
      target_type: template.target_type,
      target_value: template.target_value,
      category: 'category' in template ? template.category : undefined,
    });
    setLoading(false);
    onOpenChange(false);
  };

  const targetTypeLabels = {
    streak: 'Días de racha',
    goals_completed: 'Metas completadas',
    checkins: 'Check-ins realizados',
    category_goals: 'Metas por categoría',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            Nuevo Logro
          </SheetTitle>
        </SheetHeader>

        {/* Mode selector */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={mode === 'templates' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('templates')}
          >
            Plantillas
          </Button>
          <Button
            variant={mode === 'custom' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('custom')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Personalizado
          </Button>
        </div>

        <div className="mt-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {mode === 'templates' ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Elige los logros que quieres conseguir:
              </p>
              {ACHIEVEMENT_TEMPLATES.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectTemplate(template)}
                  disabled={loading}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all',
                    'border-border hover:border-primary hover:bg-primary/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.description}
                      </div>
                      <div className="text-xs text-primary mt-1">
                        Meta: {template.target_value} {targetTypeLabels[template.target_type].toLowerCase()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Icon and Name */}
              <div className="flex gap-3 items-start">
                <div>
                  <Label className="text-base font-medium mb-2 block">Icono</Label>
                  <EmojiPicker 
                    value={formData.icon} 
                    onChange={(icon) => setFormData({ ...formData, icon })} 
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-base font-medium">Nombre del logro</Label>
                  <Input
                    placeholder="Ej: Maestro del fitness"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-base font-medium">Descripción</Label>
                <Input
                  placeholder="Describe este logro..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2"
                />
              </div>

              {/* Target Type */}
              <div>
                <Label className="text-base font-medium">Tipo de objetivo</Label>
                <Select
                  value={formData.target_type}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    target_type: value as typeof formData.target_type,
                    category: value === 'category_goals' ? 'salud' : undefined
                  })}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {Object.entries(targetTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category (if category_goals) */}
              {formData.target_type === 'category_goals' && (
                <div>
                  <Label className="text-base font-medium">Categoría</Label>
                  <Select
                    value={formData.category || 'salud'}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {(Object.entries(CATEGORY_CONFIG) as [GoalCategory, typeof CATEGORY_CONFIG[GoalCategory]][]).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.icon} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Target Value */}
              <div>
                <Label className="text-base font-medium">Valor objetivo</Label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: Number(e.target.value) })}
                  className="mt-2 h-12"
                  min={1}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.target_type === 'streak' && 'Número de días consecutivos'}
                  {formData.target_type === 'goals_completed' && 'Número de metas a completar'}
                  {formData.target_type === 'checkins' && 'Número de check-ins a realizar'}
                  {formData.target_type === 'category_goals' && 'Metas de esta categoría a completar'}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!formData.name.trim() || loading}
              >
                {loading ? 'Creando...' : 'Crear Logro'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
