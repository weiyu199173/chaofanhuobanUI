import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Determine if we have valid credentials
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Use a placeholder if not configured to prevent crash on initialization
// The App will handle the UI if isSupabaseConfigured is false
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
