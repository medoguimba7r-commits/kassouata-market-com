-- 1. Restrict profiles SELECT: only owner can see full row (incl. phone/whatsapp)
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Public view exposing only safe fields
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT id, user_id, display_name, avatar_url, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 3. Allow public read of safe profile fields via a permissive policy scoped to the view's columns
-- Since security_invoker=on uses caller's RLS, we add a policy that allows SELECT but only when
-- the query is reading non-sensitive columns. Postgres RLS can't filter by column, so we keep
-- the strict owner-only policy on the base table and require apps to use the view.
-- Add additional permissive policy granting public read for the safe-display use case via the view:
CREATE POLICY "Public can view display info"
ON public.profiles
FOR SELECT
USING (true);

-- Wait — the above re-opens access. Instead drop it and rely on the view with SECURITY DEFINER.
DROP POLICY IF EXISTS "Public can view display info" ON public.profiles;
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate as SECURITY DEFINER view (owned by postgres) so it bypasses RLS but only exposes safe columns
CREATE VIEW public.public_profiles AS
SELECT id, user_id, display_name, avatar_url, created_at
FROM public.profiles;

ALTER VIEW public.public_profiles SET (security_invoker = off);
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 4. Tighten products INSERT/UPDATE: shop must belong to the user
DROP POLICY IF EXISTS "Users can create products in own shop" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;

CREATE POLICY "Users can create products in own shop"
ON public.products
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.shops s
    WHERE s.id = products.shop_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own products"
ON public.products
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.shops s
    WHERE s.id = products.shop_id AND s.user_id = auth.uid()
  )
);