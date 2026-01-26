import { supabase } from '../src/supabase.js';

const MANUAL_URL = 'https://seller.uzum.uz/manual';

async function crawlPage(url: string, visited: Set<string> = new Set()): Promise<void> {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Извлекаем заголовки на RU и UZ
    const titleRu = doc.querySelector('h1[lang="ru"]')?.textContent || 
                    doc.querySelector('title')?.textContent || 
                    doc.querySelector('h1')?.textContent || 
                    'No title';
    
    const titleUz = doc.querySelector('h1[lang="uz"]')?.textContent || titleRu;

    // Извлекаем контент на RU и UZ (без ограничения символов)
    const contentRuElements = doc.querySelectorAll('[lang="ru"], .content-ru, .ru');
    const contentUzElements = doc.querySelectorAll('[lang="uz"], .content-uz, .uz');
    
    let contentRu = '';
    let contentUz = '';
    
    if (contentRuElements.length > 0) {
      contentRu = Array.from(contentRuElements)
        .map(el => el.textContent)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      // Если нет явно размеченного контента, берем весь текст
      contentRu = doc.body?.textContent?.replace(/\s+/g, ' ').trim() || '';
    }
    
    if (contentUzElements.length > 0) {
      contentUz = Array.from(contentUzElements)
        .map(el => el.textContent)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      contentUz = contentRu; // Fallback к русскому контенту
    }

    // Сохраняем в Supabase
    const { data, error } = await supabase
      .from('manual_sections')
      .insert([{ 
        title_ru: titleRu,
        title_uz: titleUz,
        content_ru: contentRu,
        content_uz: contentUz,
        url 
      }]);

    if (error) console.error('Insert error:', error);
    else console.log(`✓ Crawled: ${titleRu}`);

    // Находим ссылки на другие страницы
    const links = doc.querySelectorAll('a[href]');
    for (const link of links) {
      const href = link.getAttribute('href');
      if (href) {
        let fullLink: string;
        try {
          fullLink = new URL(href, url).href;
        } catch {
          continue;
        }
        // Only crawl within the manual domain
        if (fullLink.startsWith('https://seller.uzum.uz/manual/')) {
          await crawlPage(fullLink, visited);
        }
      }
    }
  } catch (error) {
    console.error(`Error crawling ${url}:`, (error as Error).message);
  }
}

export async function runCrawl(): Promise<void> {
  console.log('Starting crawl...');
  await crawlPage(MANUAL_URL);
  console.log('Crawling completed');
}
