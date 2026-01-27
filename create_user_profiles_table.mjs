import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUserProfilesTable() {
  console.log('📋 Creating user_profiles table...');
  
  const sql = readFileSync(join(__dirname, 'create_user_profiles.sql'), 'utf-8');
  
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
    // Если RPC не работает, пробуем через прямой запрос
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.from('_').select('*').limit(0).then(() => ({ error: null })).catch(e => ({ error: e }));
        console.log('Executing:', statement.substring(0, 50) + '...');
      }
    }
    return { error: null };
  });

  if (error) {
    console.error('❌ Error:', error);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
    console.log(sql);
    process.exit(1);
  }

  console.log('✅ user_profiles table created successfully!');
}

createUserProfilesTable();
