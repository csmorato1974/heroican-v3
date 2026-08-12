// Cliente Supabase server-only con service role para el proyecto Heroican.
// Lee los secretos en tiempo de petición: nunca en scope de módulo, nunca en el bundle del cliente.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { HEROICAN_SUPABASE_URL } from './config';

function createHeroicanAdminClient() {
  const url = process.env.HEROICAN_SUPABASE_URL || HEROICAN_SUPABASE_URL;
  const serviceRoleKey = process.env.HEROICAN_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Faltan variables de entorno: HEROICAN_SUPABASE_URL / HEROICAN_SUPABASE_SERVICE_ROLE_KEY',
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Solo para uso server-side de confianza (handlers de rutas y server functions).
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createHeroicanAdminClient>, {
  get(_, prop, receiver) {
    const client = createHeroicanAdminClient();
    return Reflect.get(client, prop, receiver);
  },
});
