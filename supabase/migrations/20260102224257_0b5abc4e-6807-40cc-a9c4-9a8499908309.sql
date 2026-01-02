-- Tabla para definir los logros que el usuario quiere conseguir
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  target_type TEXT NOT NULL CHECK (target_type IN ('streak', 'goals_completed', 'checkins', 'category_goals')),
  target_value INTEGER NOT NULL DEFAULT 1,
  current_value INTEGER DEFAULT 0,
  category TEXT, -- Para logros de categoría específica
  is_earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
ON public.user_achievements
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements"
ON public.user_achievements
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_achievements_updated_at
BEFORE UPDATE ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();