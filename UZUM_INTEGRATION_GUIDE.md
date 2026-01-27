# UZUM INTEGRATION - IMPLEMENTATION GUIDE

## 📋 СПИСОК ИЗМЕНЕНИЙ

### A) Новые файлы:

1. **src/lib/crypto.ts** (211 строк)
   - WebCrypto API utilities
   - PBKDF2 key derivation (200k iterations)
   - AES-GCM-256 encryption/decryption
   - PIN validation
   - Base64 encoding/decoding

2. **src/lib/uzum-api.ts** (169 строк)
   - Uzum Seller API client
   - Configurable auth scheme (Bearer/Token/Raw)
   - Error handling (401/403/404/5xx/CORS)
   - Methods: testToken, getProducts, getShops, getOrders

3. **migrations/002_integrations.sql** (86 строк)
   - Table: integrations
   - Columns: id, user_id, provider, token_cipher, token_iv, token_salt, kdf_iterations, shop_id, metadata
   - RLS policies (TODO: update for production)
   - Auto-update timestamp trigger
   - Indexes

### B) Изменённые файлы:

1. **src/App.tsx**
   - Added imports: crypto utils, uzum-api
   - Added state (7 новых переменных)
   - Added functions (7 новых функций для Uzum)
   - Полностью переписана страница Uzum (300+ строк)

2. **.env.example**
   - Added VITE_UZUM_AUTH_SCHEME variable

## 🔐 SECURITY ARCHITECTURE

### Client-Side Encryption Flow:

```
User PIN → PBKDF2(SHA-256, 200k iter, 16-byte salt) → AES-GCM-256 key
Token → AES-GCM encrypt (12-byte IV) → Cipher (base64)
Store in DB: { cipher, iv, salt }
```

### Storage Security:
- ✅ Token NEVER in localStorage
- ✅ Token NEVER logged
- ✅ Token cleared from state after save
- ✅ PIN never sent to server
- ✅ Decryption only on client

### Database Structure:
```sql
integrations {
  user_id: telegram_user_id (text)
  provider: 'uzum'
  token_cipher: base64 encrypted
  token_iv: base64 nonce
  token_salt: base64 salt
  kdf_iterations: 200000
  metadata: { shops, sellerInfo, lastVerified }
}
```

## 📊 UI STATES

### 1. Not Connected (default)
- Purple header "○ Не подключено"
- Token input (password type)
- PIN input (6-10 chars)
- Buttons: "🔍 Проверить" + "💾 Сохранить"
- Info cards: instructions, security, features

### 2. Connected
- Green header "✓ Подключено"
- Shows seller info + shops list
- Button: "🔌 Отключить интеграцию"
- Features list

### 3. Loading
- Buttons disabled
- Text: "⏳ Проверка..." / "⏳ Сохранение..."

### 4. Error
- Red card with error message
- Specific errors: 401/403/CORS/validation

## 🚀 КАК ПРОВЕРИТЬ (3 ШАГА)

### Шаг 1: Применить миграцию

```bash
# В Supabase Dashboard → SQL Editor:
# Скопировать и выполнить migrations/002_integrations.sql
```

Или через CLI:
```bash
supabase migration up
```

### Шаг 2: Проверить переменные окружения

Добавить в `.env`:
```bash
VITE_UZUM_AUTH_SCHEME=Bearer  # или Token, или Raw
```

### Шаг 3: Запустить и протестировать

```bash
npm run dev
```

1. Открыть http://localhost:5173
2. Войти в приложение
3. Нажать кнопку "🛒 Uzum" в bottomBar
4. Ввести токен + создать PIN
5. Нажать "🔍 Проверить" → должен показать seller info
6. Нажать "💾 Сохранить" → должен сохранить в DB
7. Перезагрузить страницу → должно показать "✓ Подключено"

## ⚠️ ВАЖНЫЕ TODO

### 1. RLS Policies (КРИТИЧНО для продакшена!)

В миграции есть TODO для RLS политик:
```sql
-- Текущее (небезопасно):
USING (true)

-- Нужно заменить на:
USING (user_id = current_user_telegram_id())
```

Варианты реализации:
- **A. Supabase Auth**: `auth.uid()` если используете Supabase Auth
- **B. Custom function**: создать функцию `current_user_telegram_id()` которая берёт из JWT
- **C. Session variable**: `current_setting('app.user_id', true)`

### 2. Uzum API Endpoints

Текущие endpoints примерные, нужно проверить реальную документацию:
- `/seller-info` - для testToken
- `/products` - для списка товаров
- `/shops` - для списка магазинов
- `/orders` - для заказов

### 3. CORS Proxy

Если Uzum API блокирует CORS (вероятно будет), нужен backend proxy:
```
Frontend → Your Backend → Uzum API
```

Пример структуры:
```typescript
// backend/routes/uzum-proxy.ts
app.post('/api/uzum/test-token', async (req, res) => {
  const { token } = req.body;
  const result = await fetch('https://api-seller.uzum.uz/...', {
    headers: { Authorization: `Bearer ${token}` }
  });
  res.json(await result.json());
});
```

### 4. Decryption для использования токена

Когда понадобится использовать токен:
```typescript
import { decryptToken } from './lib/crypto';

// Попросить PIN у пользователя
const pin = prompt('Введите PIN для доступа к Uzum API');

// Загрузить зашифрованные данные из DB
const { data } = await supabase
  .from('integrations')
  .select('token_cipher, token_iv, token_salt')
  .eq('user_id', userId)
  .eq('provider', 'uzum')
  .single();

// Расшифровать
try {
  const token = await decryptToken(
    data.token_cipher,
    data.token_iv,
    data.token_salt,
    pin
  );
  
  // Использовать токен
  const result = await testToken(token);
  
  // Очистить из памяти сразу после использования
  token = null;
} catch (err) {
  alert('Неверный PIN');
}
```

## 📁 FILE TREE

```
/workspaces/vite-react2.0/
├── src/
│   ├── App.tsx                    # ИЗМЕНЁН (добавлены imports, state, functions, UI)
│   └── lib/
│       ├── crypto.ts              # НОВЫЙ (WebCrypto utilities)
│       └── uzum-api.ts            # НОВЫЙ (API client)
├── migrations/
│   └── 002_integrations.sql       # НОВЫЙ (DB schema)
├── .env.example                   # ИЗМЕНЁН (added VITE_UZUM_AUTH_SCHEME)
└── UZUM_INTEGRATION_GUIDE.md      # НОВЫЙ (этот файл)
```

## 🔧 TROUBLESHOOTING

### Error: "WebCrypto API недоступен"
→ Проверьте что используете HTTPS или localhost

### Error: "CORS блокировка"
→ Нужен backend proxy (см. TODO #3)

### Error: "Telegram user ID не найден"
→ Проверьте что Telegram WebApp правильно инициализирован

### Error: "Decryption failed: wrong PIN"
→ Пользователь ввёл неверный PIN, попробуйте снова

### Tokens не сохраняются
→ Проверьте миграцию применена: `SELECT * FROM integrations;`

### RLS блокирует запросы
→ Временно отключите RLS для теста: `ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;`
→ НЕ ЗАБУДЬТЕ включить обратно для продакшена!

## 📚 REFERENCES

- **WebCrypto API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- **AES-GCM**: https://en.wikipedia.org/wiki/Galois/Counter_Mode
- **PBKDF2**: https://en.wikipedia.org/wiki/PBKDF2
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security

## ✅ CHECKLIST

- [x] Client-side crypto utils created
- [x] Uzum API client created
- [x] Database migration created
- [x] UI implemented with full functionality
- [x] State management added
- [x] Error handling implemented
- [x] Security notices added
- [x] .env.example updated
- [ ] Миграция применена в Supabase
- [ ] RLS policies обновлены для продакшена
- [ ] Backend proxy настроен (если нужен)
- [ ] Uzum API endpoints проверены
- [ ] Протестировано end-to-end

## 💡 NEXT STEPS

1. Применить миграцию в Supabase
2. Получить тестовый Uzum API token
3. Протестировать полный flow
4. Настроить RLS для безопасности
5. Добавить backend proxy если нужен
6. Реализовать реальную синхронизацию заказов
7. Добавить аналитику и уведомления
