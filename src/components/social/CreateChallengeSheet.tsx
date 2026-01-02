import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { Swords } from 'lucide-react';

interface CreateChallengeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friendId: string;
  friendName: string;
  onCreateChallenge: (challenge: {
    opponent_id: string;
    title: string;
    description?: string;
    icon: string;
    target_value: number;
    end_date?: string;
  }) => void;
}

const CreateChallengeSheet: React.FC<CreateChallengeSheetProps> = ({
  open,
  onOpenChange,
  friendId,
  friendName,
  onCreateChallenge,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [targetValue, setTargetValue] = useState(10);
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || targetValue < 1) return;

    setLoading(true);
    await onCreateChallenge({
      opponent_id: friendId,
      title: title.trim(),
      description: description.trim() || undefined,
      icon,
      target_value: targetValue,
      end_date: endDate || undefined,
    });
    setLoading(false);

    // Reset form
    setTitle('');
    setDescription('');
    setIcon('🎯');
    setTargetValue(10);
    setEndDate('');
    onOpenChange(false);
  };

  const presetChallenges = [
    { title: 'Check-ins diarios', icon: '✅', target: 7 },
    { title: 'Metas completadas', icon: '🎯', target: 3 },
    { title: 'Días de racha', icon: '🔥', target: 7 },
    { title: 'Tareas completadas', icon: '📋', target: 20 },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Desafiar a {friendName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Preset challenges */}
          <div>
            <Label className="text-sm text-muted-foreground">Desafíos rápidos</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {presetChallenges.map((preset, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-1"
                  onClick={() => {
                    setTitle(preset.title);
                    setIcon(preset.icon);
                    setTargetValue(preset.target);
                  }}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-xs">{preset.title}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Custom challenge form */}
          <div className="space-y-4">
            <div>
              <Label>Icono</Label>
              <div className="mt-1">
                <EmojiPicker value={icon} onChange={setIcon} />
              </div>
            </div>

            <div>
              <Label>Título del desafío</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Quien complete más metas"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe las reglas del desafío..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label>Meta a alcanzar</Label>
              <Input
                type="number"
                min={1}
                value={targetValue}
                onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Fecha límite (opcional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!title.trim() || targetValue < 1 || loading}
          >
            <Swords className="w-4 h-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar desafío'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateChallengeSheet;
