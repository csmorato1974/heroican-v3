
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow anon select own" ON public.pet_registrations;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.pet_registrations;
DROP POLICY IF EXISTS "Allow public insert" ON public.pet_registrations;

-- Revoke SELECT from anon/authenticated (service_role retains all)
REVOKE SELECT ON public.pet_registrations FROM anon;
REVOKE SELECT ON public.pet_registrations FROM authenticated;

-- Keep INSERT for anon (public landing form) but add validation constraints
GRANT INSERT ON public.pet_registrations TO anon;

CREATE POLICY "Public can insert validated leads"
ON public.pet_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  consent_privacy = true
  AND consent_terms = true
  AND tutor_name IS NOT NULL AND length(tutor_name) BETWEEN 1 AND 120
  AND whatsapp IS NOT NULL AND length(whatsapp) BETWEEN 6 AND 32
  AND (city IS NULL OR length(city) <= 120)
  AND (pet_name IS NULL OR length(pet_name) <= 80)
  AND (life_stage IS NULL OR length(life_stage) <= 32)
  AND (pet_size IS NULL OR length(pet_size) <= 32)
  AND (source IS NULL OR length(source) <= 64)
  AND (dm_payload IS NULL OR length(dm_payload) <= 2000)
  AND (lead_status IS NULL OR length(lead_status) <= 32)
  AND (geolocation_status IS NULL OR length(geolocation_status) <= 32)
);
