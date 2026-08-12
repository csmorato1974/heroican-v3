// Cliente Supabase del navegador para el proyecto Heroican (URL + anon key).
// Sustituye al cliente autogenerado del proyecto anterior.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { HEROICAN_SUPABASE_ANON_KEY, HEROICAN_SUPABASE_URL } from './config';

function createHeroicanClient() {
  return createClient<Database>(HEROICAN_SUPABASE_URL, HEROICAN_SUPABASE_ANON_KEY, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _client: ReturnType<typeof createHeroicanClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createHeroicanClient>, {
  get(_, prop, receiver) {
    if (!_client) _client = createHeroicanClient();
    return Reflect.get(_client, prop, receiver);
  },
});
