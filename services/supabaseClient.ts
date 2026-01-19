
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://wqawkzxxojewybnbrzke.supabase.co';
const supabaseKey = 'sb_publishable_-zPQW7K5KC6JCT7A7iSlIg_nQNPByDA';

export const supabase = createClient(supabaseUrl, supabaseKey);
