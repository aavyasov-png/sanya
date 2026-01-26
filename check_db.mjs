import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ykbouygdeqrohizeqlmc.supabase.co',
  'sb_publishable_6sJ_KOewkD5zRln2HVDWXw_vjILs-kD'
);

const { data, error, count } = await supabase
  .from('manual_sections')
  .select('*', { count: 'exact', head: false });

if (error) {
  console.error('❌ Ошибка:', error);
} else {
  console.log(`✅ Всего записей в базе: ${count}`);
  console.log(`\n📋 Примеры записей:\n`);
  data.slice(0, 5).forEach((row, i) => {
    console.log(`${i + 1}. ${row.title}`);
    console.log(`   URL: ${row.url}`);
    console.log(`   Контент: ${row.content.substring(0, 100)}...`);
    console.log();
  });
}
