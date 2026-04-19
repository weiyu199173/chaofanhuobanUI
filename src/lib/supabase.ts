import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug log environment variables (for debugging)
console.log('🔧 Supabase Config Loaded:');
console.log('  URL:', supabaseUrl ? '✓ Configured' : '✗ Missing');
console.log('  Key:', supabaseAnonKey ? '✓ Configured' : '✗ Missing');

// Determine if we have valid credentials - simplified for debugging
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseUrl.length > 0 &&
  supabaseAnonKey && 
  supabaseAnonKey.length > 0
);

console.log('  isSupabaseConfigured:', isSupabaseConfigured);

// Use a placeholder if not configured to prevent crash on initialization
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
  }
);
