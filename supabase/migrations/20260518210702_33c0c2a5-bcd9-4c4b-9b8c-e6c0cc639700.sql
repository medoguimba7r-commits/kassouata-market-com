-- Revoke column access on sensitive contact fields from anonymous role
REVOKE SELECT (contact_phone, contact_whatsapp) ON public.products FROM anon;

-- Ensure authenticated still has full select (default), explicitly re-grant to be safe
GRANT SELECT ON public.products TO authenticated;