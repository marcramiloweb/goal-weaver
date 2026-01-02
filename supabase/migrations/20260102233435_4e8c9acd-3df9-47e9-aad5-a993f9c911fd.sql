-- Create table for shared goals (collaborative goals between friends)
CREATE TABLE public.shared_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'collaborator', -- 'owner' or 'collaborator'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(goal_id, user_id)
);

-- Add is_shared column to goals table
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.shared_goals ENABLE ROW LEVEL SECURITY;

-- Users can view shared goals they are part of
CREATE POLICY "Users can view their shared goals"
ON public.shared_goals
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT sg.user_id FROM public.shared_goals sg WHERE sg.goal_id = goal_id
));

-- Users can create shared goal entries for goals they own
CREATE POLICY "Goal owners can add collaborators"
ON public.shared_goals
FOR INSERT
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.goals WHERE id = goal_id)
  OR auth.uid() = user_id
);

-- Users can delete their own shared goal participation
CREATE POLICY "Users can leave shared goals"
ON public.shared_goals
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT g.user_id FROM public.goals g WHERE g.id = goal_id
));

-- Users can update their participation
CREATE POLICY "Users can update their participation"
ON public.shared_goals
FOR UPDATE
USING (auth.uid() = user_id);