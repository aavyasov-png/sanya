import { supabase } from '../src/supabase.js'; // Adjust path if needed

const MANUAL_URL = 'https://seller.uzum.uz/manual';

async function crawlPage(url: string, visited: Set<string> = new Set()): Promise<void> {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract title
    const title = doc.querySelector('title')?.textContent || doc.querySelector('h1')?.textContent || 'No title';

    // Extract content (all text)
    const content = doc.body?.textContent?.replace(/\s+/g, ' ').trim().substring(0, 5000) || '';

    // Save to Supabase
    const { data, error } = await supabase
      .from('manual_sections')
      .insert([{ title, content, url }]);

    if (error) console.error('Insert error:', error);

    // Find links to other pages
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
