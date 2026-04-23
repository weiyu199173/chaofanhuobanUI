import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yzhxcljvdcizmxtbxkip.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_k2gpmU7GTsKdFfp_GTT4TA_c6Ja55fp';

// User requested to switch to local database (memory state). We explicitly force this to false.
export const isSupabaseConfigured = false;

// Use a placeholder if not configured to prevent crash on initialization
export const supabase = createClient(
  'https://placeholder.supabase.co',
  'placeholder'
);
