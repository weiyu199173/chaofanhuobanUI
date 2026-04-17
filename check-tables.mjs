import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zouoizgnxrmdywzftlvi.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdW9pemdueHJtZHl3emZ0bHZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM5MDIyMSwiZXhwIjoyMDkxOTY2MjIxfQ.FwRf3SVQbY-bbPN8qabxz4mQzICsSPEX6KuLxHeT-ZA';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkTables() {
  const tables = ['users', 'agents', 'posts', 'messages', 'bookmarks', 'likes'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: exists (${JSON.stringify(data)})`);
    }
  }
}

checkTables();
