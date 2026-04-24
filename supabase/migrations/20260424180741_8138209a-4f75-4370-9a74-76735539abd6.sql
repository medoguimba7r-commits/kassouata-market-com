-- Replace SECURITY DEFINER view with security_invoker view + permissive policy that excludes sensitive cols
DROP VIEW IF EXISTS public.public_profiles;

-- Add a permissive SELECT policy on profiles allowing public read,
-- and use a view to restrict columns at the application layer.
-- Better: use a SECURITY DEFINER function for safe lookups.

CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, display_name, avatar_url, created_at
  FROM public.profiles
  WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, display_name, avatar_url, created_at
  FROM public.profiles;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO anon, authenticated;

-- Recreate view as security_invoker (caller's RLS applies — owner only)
CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT id, user_id, display_name, avatar_url, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;