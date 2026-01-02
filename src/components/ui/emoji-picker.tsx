import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const EMOJI_CATEGORIES = {
  faces: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵'],
  objects: ['📚', '📖', '📝', '✏️', '📎', '📌', '📍', '🔍', '🔎', '🔐', '🔑', '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🪃', '🏹', '🛡️', '🪚', '🔧', '🪛', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🪝', '🧰', '🧲', '🪜', '💎', '💰', '💴', '💵', '💶', '💷', '💳', '💸', '🧾', '💹'],
  nature: ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪹', '🪺', '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🫘', '🌰'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟', '✨', '💫', '🔥', '💥', '⚡', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🎵', '🎶', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻'],
  goals: ['🎯', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎟️', '🎫', '🎪', '🤹', '🎭', '🎨', '🎬', '🎤', '🎧', '🎰', '🎲', '🧩', '♟️', '🎮', '🕹️', '🎳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🙏', '👐', '🤲', '🙌', '👏', '🤝', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💅', '✍️', '🤳'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢'],
  food: ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾'],
};

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('goals');
  const [customEmoji, setCustomEmoji] = useState('');

  const categoryLabels: Record<keyof typeof EMOJI_CATEGORIES, { label: string; icon: string }> = {
    goals: { label: 'Metas', icon: '🎯' },
    faces: { label: 'Caras', icon: '😀' },
    activities: { label: 'Actividades', icon: '⚽' },
    objects: { label: 'Objetos', icon: '📚' },
    nature: { label: 'Naturaleza', icon: '🌸' },
    symbols: { label: 'Símbolos', icon: '❤️' },
    travel: { label: 'Viajes', icon: '✈️' },
    food: { label: 'Comida', icon: '🍕' },
  };

  const handleSelectEmoji = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  const handleCustomEmoji = () => {
    if (customEmoji.trim()) {
      onChange(customEmoji.trim());
      setCustomEmoji('');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-16 h-16 text-3xl rounded-xl border-2 hover:border-primary',
            className
          )}
        >
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-background border shadow-lg z-50" 
        align="start"
        sideOffset={8}
      >
        {/* Category tabs */}
        <div className="flex overflow-x-auto border-b bg-muted/30 p-1 gap-1">
          {Object.entries(categoryLabels).map(([key, { icon }]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as keyof typeof EMOJI_CATEGORIES)}
              className={cn(
                'flex-shrink-0 w-8 h-8 text-lg rounded-md transition-colors',
                activeCategory === key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              )}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="p-2 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleSelectEmoji(emoji)}
                className={cn(
                  'w-8 h-8 text-xl rounded-md hover:bg-muted transition-colors',
                  value === emoji && 'bg-primary/20 ring-2 ring-primary'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Custom emoji input */}
        <div className="p-2 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              placeholder="Pega tu emoji..."
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              className="h-8 text-base"
            />
            <Button 
              size="sm" 
              onClick={handleCustomEmoji}
              disabled={!customEmoji.trim()}
              className="h-8"
            >
              Usar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
