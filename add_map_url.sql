-- Добавить поле map_url в таблицу cards
ALTER TABLE cards ADD COLUMN IF NOT EXISTS map_url TEXT;

-- Проверить структуру таблицы
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cards';
