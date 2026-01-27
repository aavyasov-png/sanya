-- Создать упрощённую таблицу access_codes для работы без API
-- Хеши создаются на клиенте через bcryptjs

DROP TABLE IF EXISTS access_codes CASCADE;

CREATE TABLE access_codes (
  code_hash TEXT PRIMARY KEY, -- bcrypt hash 6-значного кода
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER, -- null = unlimited
  uses_count INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  display_code TEXT, -- Для отображения в админке (без первых цифр для безопасности)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Разрешить полный доступ
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on access_codes"
  ON access_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_access_codes_active ON access_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_access_codes_expires ON access_codes(expires_at);

-- Пример добавления кода "123456" (хеш нужно генерировать через bcryptjs)
-- INSERT INTO access_codes (code_hash, role, display_code, note) VALUES
--   ('$2a$10$...', 'viewer', '**3456', 'Тестовый код');
