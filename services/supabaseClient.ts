
import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURATION FOR: ConstructAI
 * Supabase Project: wqawkzxxojewybnbrzke
 */

const supabaseUrl = 'https://wqawkzxxojewybnbrzke.supabase.co';
// The user has confirmed the key is configured. 
// We use the provided key but ensure it's treated as a real production client.
const supabaseKey: string = 'sb_publishable_-zPQW7K5KC6JCT7A7iSlIg_nQNPByDA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' 
  }
});

console.log("[ConstructAI] Production Network Core Active.");
