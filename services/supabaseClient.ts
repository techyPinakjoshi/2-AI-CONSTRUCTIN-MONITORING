
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// This URL must match your project settings in the Supabase Dashboard
const supabaseUrl = 'https://wqawkzxxojewybnbrzke.supabase.co';
// The publishable key allows client-side authentication
const supabaseKey = 'sb_publishable_-zPQW7K5KC6JCT7A7iSlIg_nQNPByDA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
