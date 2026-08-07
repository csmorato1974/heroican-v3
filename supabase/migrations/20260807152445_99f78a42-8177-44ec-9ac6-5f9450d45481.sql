CREATE TABLE public.ai_usage_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  provider text NOT NULL DEFAULT 'openai',
  model text NOT NULL,
  route text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  latency_ms integer,
  success boolean NOT NULL DEFAULT true,
  fallback boolean NOT NULL DEFAULT false,
  error_status text,
  request_id text
);

GRANT ALL ON public.ai_usage_events TO service_role;

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages ai usage events"
ON public.ai_usage_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX ai_usage_events_created_at_idx ON public.ai_usage_events (created_at DESC);