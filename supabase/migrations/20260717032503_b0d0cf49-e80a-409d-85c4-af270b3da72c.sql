GRANT INSERT ON public.pet_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pet_registrations TO authenticated;
GRANT ALL ON public.pet_registrations TO service_role;