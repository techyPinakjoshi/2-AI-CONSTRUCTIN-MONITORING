import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wqawkzxxojewybnbrzke.supabase.co';
const supabaseKey = 'sb_publishable_-zPQW7K5KC6JCT7A7iSlIg_nQNPByDA';

let supabaseInstance;
try {
  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
} catch (error) {
  console.error("Supabase Initialization Error:", error);
  // Fallback mock or handled error state
}

export const supabase = supabaseInstance;