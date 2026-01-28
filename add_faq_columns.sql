-- Добавление колонок slug и category в таблицу faq

-- Добавить колонку slug (уникальный идентификатор для ссылок)
ALTER TABLE faq 
ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT '';

-- Добавить колонку category (категория FAQ)
ALTER TABLE faq 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Создать индекс для быстрого поиска по slug
CREATE INDEX IF NOT EXISTS idx_faq_slug ON faq(slug);

-- Создать индекс для фильтрации по категории
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category);

-- Комментарии для документации
COMMENT ON COLUMN faq.slug IS 'Уникальный текстовый идентификатор для создания прямых ссылок на FAQ';
COMMENT ON COLUMN faq.category IS 'Категория FAQ: general, calculator, commissions, uzum';
