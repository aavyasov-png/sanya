# Коды доступа с серверным хешированием (Cloudflare Functions + bcrypt)

## ✅ Реализовано

Система кодов доступа с **bcrypt-хешированием на сервере** через Cloudflare Functions:

- **🔐 Безопасность**: Хеширование bcrypt (rounds=10) на сервере, не на клиенте
- **🔢 Формат**: 6-значные цифровые коды (100000-999999)
- **🤖 Автогенерация**: Оставьте поле "Код" пустым для автогенерации
- **📊 Метрики**: Счётчик использований (uses_count), лимит (max_uses)
- **🎭 Маскировка**: В UI показывается ****42 вместо полного кода
- **⏰ Срок действия**: Опциональное поле expires_at

## 🚀 Быстрый старт

### 1. Применить SQL-миграцию

Выполните в Supabase SQL Editor:

```sql
-- Содержимое create_simple_access_codes.sql
DROP TABLE IF EXISTS access_codes CASCADE;

CREATE TABLE access_codes (
  code_hash TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  display_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on access_codes"
  ON access_codes FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_access_codes_active ON access_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_access_codes_expires ON access_codes(expires_at);
```

### 2. Настроить переменные окружения в Cloudflare

В Cloudflare Dashboard → Pages → Settings → Environment variables:

```
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

### 3. Деплой на Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy dist
```

### 4. Создать первый код

1. Войдите с кодом **SANYA4565** (хардкод для админа)
2. Откроется админ-панель → "Коды доступа"
3. Создайте код:
   - Код: оставьте пустым (автогенерация) или введите 6 цифр
   - Роль: viewer/editor/admin/owner
   - Макс. использований: пустое = ∞
   - Срок: опционально
4. Код покажется **ОДИН РАЗ** → скопируйте!

### 5. Использовать код

1. Откройте приложение
2. Введите 6-значный код
3. Примите правила
4. Готово! Роль присвоена

## 📂 Структура API

### Cloudflare Functions (папка /functions)

```
/functions/api/auth/verify-code.ts        # POST - проверка кода
/functions/api/admin/access-codes.ts      # GET/POST/DELETE - управление
```

### API Endpoints

**POST /api/auth/verify-code**
```json
Request: { "code": "123456" }
Response: { "success": true, "user": { "role": "viewer" } }
```

**GET /api/admin/access-codes**
```json
Response: { "codes": [{ "code_hash": "...", "role": "viewer", ... }] }
```

**POST /api/admin/access-codes**
```json
Request: { "code": "123456", "role": "viewer", "max_uses": null, ... }
Response: { "success": true, "code": "123456" }
```

**DELETE /api/admin/access-codes?hash=...**
```json
Response: { "success": true }
```

## 🔍 Отладка

Откройте DevTools Console:

```javascript
// При проверке кода:
[CODE] Calling API to verify code...
[CODE] API response status: 200
[CODE] API success: { success: true, user: { role: "viewer" } }

// При создании кода:
[ADMIN] Creating code via API...
[ADMIN] Code created: 123456
```

В localStorage:
```javascript
access_ok = "1"
user_role = "viewer"
admin_ok = "1"  // только для admin/owner
```

## 🛡️ Безопасность

✅ **Защищено:**
- Хеширование bcrypt на сервере (не на клиенте!)
- Коды хранятся как хеши (необратимо)
- Исходный код показывается только при создании
- Маскировка в UI (****42)
- Счётчик использований
- Проверка срока действия

❌ **Не хранится:**
- Исходные коды в БД (только хеши)
- Коды в логах
- Коды в localStorage

## ⚠️ Важно

- **Переменные окружения** должны быть настроены в Cloudflare Dashboard (не в .env!)
- **Cloudflare Functions** автоматически обрабатывают /api/* запросы
- **Первый деплой** может занять 1-2 минуты (билд + деплой Functions)
- **Обновление кодов** не поддерживается (только создание/удаление)
- **Хеш = PRIMARY KEY**, поэтому дубликаты невозможны

## 📄 Подробная документация

См. [FIX_ACCESS_CODES.md](FIX_ACCESS_CODES.md)