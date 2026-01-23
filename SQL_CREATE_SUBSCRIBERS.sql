-- Создать таблицу для хранения ID пользователей, которые открыли приложение
CREATE TABLE IF NOT EXISTS telegram_subscribers (
  id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Разрешить чтение и запись для всех
ALTER TABLE telegram_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to insert and update telegram subscribers"
  ON telegram_subscribers
  FOR ALL
  USING (true);
