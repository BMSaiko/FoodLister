-- Migration 039: Add admin role to profiles
-- Adds is_admin column and admin_roles table for granular permissions

-- Add admin flag to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if user has admin privileges';

-- Create partial index for admin queries (only indexes true values)
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin 
  ON public.profiles(is_admin) WHERE is_admin = true;

-- Create admin_roles table for granular permissions
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'moderator', 'viewer')),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_roles_pkey PRIMARY KEY (id),
  CONSTRAINT admin_roles_user_id_key UNIQUE (user_id)
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage admin roles
CREATE POLICY "Only super admins can manage admin roles"
  ON public.admin_roles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Anyone can read their own admin role (for UI display)
CREATE POLICY "Users can read their own admin role"
  ON public.admin_roles FOR SELECT
  USING (
    user_id = auth.uid()
  );

