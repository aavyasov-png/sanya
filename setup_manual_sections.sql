-- Удаляем старые политики если существуют
DROP POLICY IF EXISTS "Allow public read access" ON manual_sections;
DROP POLICY IF EXISTS "Allow public insert" ON manual_sections;
DROP POLICY IF EXISTS "Allow public update" ON manual_sections;

-- Удаляем старую таблицу если существует
DROP TABLE IF EXISTS manual_sections CASCADE;

-- Создание таблицы manual_sections с поддержкой RU и UZ
CREATE TABLE manual_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ru TEXT,
  title_uz TEXT,
  content_ru TEXT,
  content_uz TEXT,
  url TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS
ALTER TABLE manual_sections ENABLE ROW LEVEL SECURITY;

-- Политика: разрешить всем читать
CREATE POLICY "Allow public read access" 
ON manual_sections 
FOR SELECT 
USING (true);

-- Политика: разрешить всем вставлять (для краулера)
CREATE POLICY "Allow public insert" 
ON manual_sections 
FOR INSERT 
WITH CHECK (true);

-- Политика: разрешить всем обновлять
CREATE POLICY "Allow public update" 
ON manual_sections 
FOR UPDATE 
USING (true);

-- Создаем индекс для быстрого поиска по URL
CREATE INDEX IF NOT EXISTS idx_manual_sections_url ON manual_sections(url);

-- Создаем полнотекстовый индекс для поиска
CREATE INDEX IF NOT EXISTS idx_manual_sections_content_ru ON manual_sections USING gin(to_tsvector('russian', content_ru));
CREATE INDEX IF NOT EXISTS idx_manual_sections_content_uz ON manual_sections USING gin(to_tsvector('russian', content_uz));
CREATE INDEX IF NOT EXISTS idx_manual_sections_title_ru ON manual_sections USING gin(to_tsvector('russian', title_ru));
CREATE INDEX IF NOT EXISTS idx_manual_sections_title_uz ON manual_sections USING gin(to_tsvector('russian', title_uz));
