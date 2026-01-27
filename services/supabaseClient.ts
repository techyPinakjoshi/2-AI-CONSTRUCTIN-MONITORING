
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wqawkzxxojewybnbrzke.supabase.co';
const supabaseKey = 'sb_publishable_-zPQW7K5KC6JCT7A7iSlIg_nQNPByDA';

let supabaseInstance: any = null;

try {
  if (!supabaseUrl || !supabaseKey || supabaseKey.startsWith('sb_')) {
    console.warn("Supabase configuration might be invalid or using placeholder keys.");
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
} catch (error) {
  console.error("Supabase Initialization Critical Error:", error);
  // Create a minimal mock to prevent total app failure
  supabaseInstance = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
      upsert: () => ({ select: () => Promise.resolve({ data: null, error: new Error("Offline Mode") }) }),
      insert: () => Promise.resolve({ error: new Error("Offline Mode") })
    })
  };
}

export const supabase = supabaseInstance;
