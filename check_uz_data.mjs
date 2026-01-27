import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ykbouygdeqrohizeqlmc.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_6sJ_KOewkD5zRln2HVDWXw_vjILs-kD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUzData() {
  console.log('🔍 Проверка узбекских данных...\n');
  
  const { data, error } = await supabase
    .from('product_categories')
    .select('category_id, category1_ru, category1_uz, category2_ru, category2_uz')
    .limit(10);

  if (error) {
    console.error('❌ Ошибка:', error);
    return;
  }

  console.log('📊 Первые 10 записей:\n');
  data.forEach((row, i) => {
    console.log(`${i + 1}. ID: ${row.category_id}`);
    console.log(`   RU: ${row.category1_ru} → ${row.category2_ru || '-'}`);
    console.log(`   UZ: ${row.category1_uz || 'ПУСТО!'} → ${row.category2_uz || '-'}`);
    console.log('');
  });

  const emptyUz = data.filter(r => !r.category1_uz).length;
  console.log(`⚠️  Записей без узбекских названий: ${emptyUz} из ${data.length}`);
}

checkUzData();
