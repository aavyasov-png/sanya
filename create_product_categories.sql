-- Таблица категорий товаров с комиссиями
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL UNIQUE,
  cat_code TEXT,
  category1_ru TEXT,
  category2_ru TEXT,
  category3_ru TEXT,
  category4_ru TEXT,
  category5_ru TEXT,
  category6_ru TEXT,
  category1_uz TEXT,
  category2_uz TEXT,
  category3_uz TEXT,
  category4_uz TEXT,
  category5_uz TEXT,
  category6_uz TEXT,
  comm_fbo NUMERIC(5,2),
  comm_fbs NUMERIC(5,2),
  comm_dbs NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать
CREATE POLICY "Allow read access to product_categories" 
  ON product_categories 
  FOR SELECT 
  USING (true);

-- Политика: все могут вставлять (для импорта)
CREATE POLICY "Allow insert access to product_categories" 
  ON product_categories 
  FOR INSERT 
  WITH CHECK (true);

-- Политика: все могут обновлять (для импорта)
CREATE POLICY "Allow update access to product_categories" 
  ON product_categories 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_cat1_ru ON product_categories(category1_ru);
CREATE INDEX IF NOT EXISTS idx_product_categories_cat1_uz ON product_categories(category1_uz);
CREATE INDEX IF NOT EXISTS idx_product_categories_cat2_ru ON product_categories(category2_ru);
CREATE INDEX IF NOT EXISTS idx_product_categories_cat2_uz ON product_categories(category2_uz);

-- Полнотекстовый поиск
CREATE INDEX IF NOT EXISTS idx_product_categories_fulltext_ru ON product_categories 
  USING gin(to_tsvector('russian', 
    coalesce(category1_ru, '') || ' ' || 
    coalesce(category2_ru, '') || ' ' || 
    coalesce(category3_ru, '') || ' ' || 
    coalesce(category4_ru, '') || ' ' || 
    coalesce(category5_ru, '') || ' ' || 
    coalesce(category6_ru, '')
  ));
