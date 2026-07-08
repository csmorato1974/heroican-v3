DROP POLICY IF EXISTS "Anyone can insert pet analysis events" ON public.pet_analysis_events;

CREATE POLICY "Anyone can insert pet analysis events"
ON public.pet_analysis_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(session_id) BETWEEN 1 AND 64
  AND (detected_animal IS NULL OR length(detected_animal) <= 64)
  AND (size_guess IS NULL OR length(size_guess) <= 32)
  AND (recommended_focus IS NULL OR length(recommended_focus) <= 32)
  AND (error_type IS NULL OR length(error_type) <= 64)
  AND (source IS NULL OR length(source) <= 64)
  AND (campaign IS NULL OR length(campaign) <= 64)
);