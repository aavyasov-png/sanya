-- Проверка существования таблицы access_codes с правильной структурой
-- Таблица должна быть создана через migrations/001_users_and_roles.sql

-- Добавить дополнительное поле для отображения исходного кода (только для отображения в админке)
-- ВНИМАНИЕ: Это поле НЕ для аутентификации! Используется только для показа кода администратору
ALTER TABLE access_codes ADD COLUMN IF NOT EXISTS display_code TEXT;

-- Создать индекс для display_code
CREATE INDEX IF NOT EXISTS idx_access_codes_display_code ON access_codes(display_code);

-- Добавить комментарии
COMMENT ON COLUMN access_codes.display_code IS 'Отображаемый код (не используется для проверки, только для UI)';

-- Пример: добавление тестового кода через API
-- Используйте POST /api/admin/access-codes для создания кодов
-- Или вручную через bcrypt:

-- Пример хеша для кода "TEST2024" (bcrypt rounds=10):
-- INSERT INTO access_codes (code_hash, role_to_assign, note, display_code, max_uses) VALUES
--   ('$2a$10$...', 'viewer', 'Тестовый код', 'TEST2024', NULL);

-- Для генерации хеша используйте:
-- https://bcrypt-generator.com/ или API endpoint POST /api/admin/access-codes
