-- Drop existing restrictive policy on profiles for SELECT
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a new policy that allows users to view all profiles (for friend search)
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Add email column to profiles for friend search (optional, synced from auth)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;