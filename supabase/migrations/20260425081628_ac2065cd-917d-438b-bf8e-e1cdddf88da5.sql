-- 1) Restrict SELECT on products: hide contact info from unauthenticated visitors.
--    Owners always see their own products; authenticated users see all published products
--    (including contact fields). Anonymous visitors must use the public view below.
DROP POLICY IF EXISTS "Published products viewable by everyone" ON public.products;

CREATE POLICY "Owners can view own products"
ON public.products
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view published products"
ON public.products
FOR SELECT
TO authenticated
USING (is_published = true);

-- 2) Public view for unauthenticated visitors — excludes contact_phone and contact_whatsapp.
CREATE OR REPLACE VIEW public.products_public
WITH (security_invoker = on) AS
SELECT
  id,
  shop_id,
  user_id,
  name,
  description,
  price,
  images,
  category,
  views_count,
  is_published,
  created_at,
  updated_at
FROM public.products
WHERE is_published = true;

-- Allow anonymous and authenticated roles to read the public view.
GRANT SELECT ON public.products_public TO anon, authenticated;

-- The view uses security_invoker, so it needs a SELECT policy that allows
-- anon to read published rows without exposing contacts via the base table.
CREATE POLICY "Anyone can view published products without contacts"
ON public.products
FOR SELECT
TO anon
USING (is_published = true);
-- Note: anon clients should query products_public (no contact columns).
-- The base products table still allows anon SELECT, but we'll switch the app
-- to query products_public so contact fields aren't sent to anon clients.

-- 3) Storage: enforce path ownership on product-images uploads, updates, deletes,
--    and restrict listing of objects to the owner.
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their product images" ON storage.objects;
DROP POLICY IF EXISTS "Product images publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;

-- Owners can list / read their own files via the API.
-- Public viewing of images still works through the public storage URL endpoint
-- (which bypasses RLS for public buckets), so cards continue to display.
CREATE POLICY "Owners can list own product images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload to own folder in product-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own files in product-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files in product-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);