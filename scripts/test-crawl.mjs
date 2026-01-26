import { createClient } from '@supabase/supabase-js';
import { JSDOM } from 'jsdom';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: переменные окружения VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY не установлены');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MANUAL_URL = 'https://seller.uzum.uz/manual';

async function crawlPage(url, visited = new Set()) {
  if (visited.has(url)) return;
  visited.add(url);

  console.log(`📡 Краулинг: ${url}`);

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Extract title
    const title = doc.querySelector('title')?.textContent || doc.querySelector('h1')?.textContent || 'No title';

    // Extract content (all text) - без ограничения в 5000 символов
    const content = doc.body?.textContent?.replace(/\s+/g, ' ').trim() || '';

    console.log(`  📝 Заголовок: ${title}`);
    console.log(`  📄 Контент (длина): ${content.length} символов`);

    // Определяем язык по URL
    const isUzbek = url.includes('/uz/');
    const lang = isUzbek ? 'uz' : 'ru';
    
    // Проверяем существующую запись
    const { data: existing } = await supabase
      .from('manual_sections')
      .select('*')
      .eq('url', url)
      .single();

    let result;
    if (existing) {
      // Обновляем существующую запись
      const updateData = isUzbek 
        ? { title_uz: title, content_uz: content }
        : { title_ru: title, content_ru: content };
      
      result = await supabase
        .from('manual_sections')
        .update(updateData)
        .eq('url', url);
    } else {
      // Создаем новую запись
      const insertData = isUzbek
        ? { url, title_uz: title, content_uz: content }
        : { url, title_ru: title, content_ru: content };
      
      result = await supabase
        .from('manual_sections')
        .insert([insertData]);
    }

    const { data, error } = result;

    if (error) {
      console.error(`  ❌ Ошибка ${existing ? 'обновления' : 'вставки'}:`, error.message);
    } else {
      console.log(`  ✅ ${existing ? 'Обновлено' : 'Сохранено'} в базу (${lang})`);
    }

    // Find links to other pages
    const links = doc.querySelectorAll('a[href]');
    let foundLinks = 0;
    for (const link of links) {
      const href = link.getAttribute('href');
      if (href) {
        let fullLink;
        try {
          fullLink = new URL(href, url).href;
        } catch {
          continue;
        }
        // Only crawl within the manual domain
        if (fullLink.startsWith('https://seller.uzum.uz/manual/') && !visited.has(fullLink)) {
          foundLinks++;
          await crawlPage(fullLink, visited);
        }
      }
    }
    console.log(`  🔗 Найдено новых ссылок: ${foundLinks}`);

  } catch (error) {
    console.error(`  ❌ Ошибка краулинга ${url}:`, error.message);
  }
}

async function runCrawl() {
  console.log('🚀 Начало краулинга...');
  console.log(`🎯 Стартовый URL: ${MANUAL_URL}\n`);
  
  await crawlPage(MANUAL_URL);
  
  console.log('\n✨ Краулинг завершён');
  
  // Показать статистику
  const { data, error } = await supabase
    .from('manual_sections')
    .select('*', { count: 'exact' });
    
  if (!error) {
    console.log(`📊 Всего записей в базе: ${data.length}`);
  }
}

runCrawl();
