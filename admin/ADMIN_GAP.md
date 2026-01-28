# 📋 ADMIN_GAP.md - Инвентаризация текущего проекта

**Дата:** 2024  
**Цель:** Полный анализ существующей админ-инфраструктуры и определение пробелов  
**Статус:** ✅ ИНВЕНТАРИЗАЦИЯ ЗАВЕРШЕНА

---

## 🏗️ АРХИТЕКТУРА ПРОЕКТА

### Frontend Stack
- **Framework:** React 18 + TypeScript + Vite
- **UI Components:** Custom CSS + Tailwind-like classes
- **API Client:** Custom `APIClient` in `src/lib/api.ts`
- **Database:** Supabase (PostgreSQL)
- **Main App:** 5054 строк в `/src/App.tsx` (монолит)

### Backend Stack
- **API Gateway:** Cloudflare Pages Functions (`functions/api/`)
- **Database:** Supabase PostgreSQL
- **Authentication:** JWT tokens + localStorage
- **Encryption:** WebCrypto (AES-GCM for tokens)

---

## 📂 СТРУКТУРА АДМИНКИ

### Расположение
- **Main App:** `/src/App.tsx` (lines ~2700-5050)
- **Route Name:** `{ name: "admin" }`
- **Admin Tabs:**
  - `sections` - управление разделами (RBAC: EDITOR+)
  - `cards` - управление карточками (RBAC: EDITOR+)
  - `news` - управление новостями (RBAC: ADMIN+)
  - `faq` - управление FAQ (RBAC: ADMIN+)
  - `codes` - управление кодами доступа (RBAC: ADMIN+)

### Функции управления
- `adminSaveSection()` / `adminDeleteSection()` - Supabase CRUD
- `adminSaveCard()` / `adminDeleteCard()` - Supabase CRUD
- `adminSaveNews()` / `adminDeleteNews()` - Supabase CRUD
- `adminSaveFaq()` / `adminDeleteFaq()` - Supabase CRUD
- `adminSaveCode()` / `deleteAccessCode()` - Supabase CRUD
- `adminSignOut()` - выход из админки
- `canEdit()` - проверка прав на редактирование
- `canManage()` - проверка прав на управление
- `canFullAccess()` - проверка прав owner

### Admin Components
- ✅ **AccessCodesManagement.tsx** - компонент для управления кодами (227 строк)
- ✅ **UsersManagement.tsx** - компонент для управления пользователями
- ⚠️ **Inline** - управление разделами, карточками, новостями и FAQ встроено в App.tsx

---

## 🗄️ СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ БД

### ✅ Таблица: `sections`
```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,
  title_ru TEXT,
  title_uz TEXT,
  icon TEXT,
  sort INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```
**Использование:** Разделы меню  
**RBAC:** Чтение: всем, Редактирование: EDITOR+  
**Функции:** App.tsx lines ~850-1200

### ✅ Таблица: `cards`
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES sections(id),
  title_ru TEXT,
  title_uz TEXT,
  body_ru TEXT,
  body_uz TEXT,
  sort INTEGER,
  file_url TEXT,
  map_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```
**Использование:** Карточки внутри разделов  
**RBAC:** Чтение: всем, Редактирование: EDITOR+  
**Функции:** App.tsx lines ~1200-1300

### ✅ Таблица: `news`
```sql
CREATE TABLE news (
  id UUID PRIMARY KEY,
  title_ru TEXT,
  title_uz TEXT,
  body_ru TEXT,
  body_uz TEXT,
  published_at DATE,
  pinned BOOLEAN,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```
**Использование:** Новости  
**RBAC:** Чтение: всем, Создание: ADMIN+  
**Функции:** App.tsx lines ~1300-1420

### ✅ Таблица: `faq`
```sql
CREATE TABLE faq (
  id UUID PRIMARY KEY,
  question_ru TEXT,
  question_uz TEXT,
  answer_ru TEXT,
  answer_uz TEXT,
  sort INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```
**Использование:** Часто задаваемые вопросы  
**RBAC:** Чтение: всем, Создание: ADMIN+  
**Функции:** App.tsx lines ~1370-1420

### ✅ Таблица: `access_codes`
```sql
CREATE TABLE access_codes (
  id UUID PRIMARY KEY,
  code_hash TEXT UNIQUE, -- bcrypt
  role TEXT NOT NULL DEFAULT 'viewer',
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  note TEXT,
  display_code TEXT, -- маскированный (****42)
  created_at TIMESTAMPTZ
)
```
**Использование:** Коды для регистрации пользователей  
**RBAC:** Управление: ADMIN+  
**Компонент:** AccessCodesManagement.tsx (227 строк)  
**Функции:** App.tsx lines ~4860-4930

### ✅ Таблица: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ
)
```
**Использование:** Пользователи системы  
**RBAC:** Управление: OWNER  
**Компонент:** UsersManagement.tsx  
**Статус:** ⚠️ Есть компонент, но нет интеграции в App.tsx admin routes

### ✅ Таблица: `user_sessions`
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_hash TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT
)
```
**Использование:** Активные JWT сессии  
**RBAC:** Система (API only)  
**Статус:** ⚠️ Создана миграцией, но не используется в current code

### ✅ Таблица: `audit_log`
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT, -- 'create', 'update', 'delete', 'login'
  resource_type TEXT, -- 'section', 'card', 'news', 'faq', etc
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ
)
```
**Использование:** История всех действий  
**RBAC:** Чтение: ADMIN+  
**Статус:** ❌ ТАБЛИЦА СУЩЕСТВУЕТ, НО НЕ ЛОГИРУЕТСЯ

### ✅ Таблица: `integrations`
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id TEXT,
  provider TEXT, -- 'uzum', 'kaspi', etc
  token_cipher TEXT, -- AES-GCM encrypted
  token_iv TEXT,
  token_salt TEXT,
  kdf_iterations INTEGER,
  shop_id BIGINT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```
**Использование:** Хранение зашифрованных API токенов Uzum  
**RBAC:** Приватное (user_id)  
**Статус:** ✅ Работает с Uzum dashboard

### ⚠️ Таблица: `manual_sections`
```sql
CREATE TABLE manual_sections (
  id UUID PRIMARY KEY,
  title_ru TEXT,
  title_uz TEXT,
  content_ru TEXT,
  content_uz TEXT,
  url TEXT UNIQUE,
  created_at TIMESTAMPTZ
)
```
**Использование:** Краулер для загрузки документации  
**RBAC:** Публичное (RLS: true for all)  
**Статус:** ⚠️ Создана, но не интегрирована в админку

### ⚠️ Таблица: `telegram_subscribers`
```sql
CREATE TABLE telegram_subscribers (
  id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP,
  last_seen TIMESTAMP
)
```
**Использование:** Подписчики Telegram-бота  
**RBAC:** Публичное  
**Статус:** ⚠️ Используется для отправки уведомлений, но нет управления в админке

---

## 🔐 СУЩЕСТВУЮЩАЯ RBAC СИСТЕМА

### Роли (в коде)
```
👑 OWNER     - полный доступ
⚙️  ADMIN     - управление контентом (новости, FAQ, коды)
✏️  EDITOR    - редактирование (разделы, карточки)
👁️  VIEWER    - только чтение
```

### Проверки прав (App.tsx lines ~1095-1120)
```typescript
const canEdit = () => ["owner", "admin", "editor"].includes(userRole);
const canManage = () => ["owner", "admin"].includes(userRole);
const canFullAccess = () => userRole === "owner";

// localStorage хранит:
localStorage.setItem("user_role", "viewer");
localStorage.setItem("access_ok", "1");
localStorage.setItem("admin_ok", "1"); // для админки
```

### Проблемы текущей системы
1. ❌ **RBAC в localStorage** - небезопасно, может быть подделана
2. ❌ **Нет JWT токена** - сессии не валидируются на сервере
3. ❌ **Нет проверок на API** - все операции выполняются как клиент
4. ❌ **Нет RLS политик** - Supabase RLS disabled (`USING (true)`)
5. ⚠️ **Нет middleware** - endpoint-ы не проверяют права доступа

### API Endpoints (App.tsx использует Supabase)
- ❌ `GET /admin/users` - есть в api.ts, не используется
- ❌ `PATCH /admin/users` - есть в api.ts, не используется
- ✅ `GET /admin/access-codes` - работает через AccessCodesManagement
- ✅ `POST /admin/access-codes` - работает через AccessCodesManagement
- ✅ `DELETE /admin/access-codes` - работает через AccessCodesManagement

### API Client (lib/api.ts - 180 строк)
```typescript
class APIClient {
  setToken(token: string | null) // сохраняет в localStorage
  verifyCode(code: string) // Auth endpoint
  getUsers() // GET /admin/users
  updateUser(id, data) // PATCH /admin/users
  getAccessCodes() // GET /admin/access-codes
  createAccessCode(data) // POST /admin/access-codes
  deleteAccessCode(id) // DELETE /admin/access-codes
}
```

**Статус:** Подготовлен к server-side RBAC, но client-side код не использует

---

## 📊 АНАЛИЗ ПО ТРЕБОВАНИЯМ ШАГ 1-7

### ШАГ 1-2: UX Компоненты для Telegram Mini App ✅
- ✅ EmptyState.tsx - компонент для пустых состояний
- ✅ UzumStatusBlock.tsx - статус блок для Uzum
- ✅ GettingStartedBlock.tsx - блок "начало работы"
- ✅ Оптимизирована текстовая информация (RU/UZ)

### ШАГ 3: Оптимизированы Empty States ✅
- ✅ UzumDashboard - пустое состояние
- ✅ UzumProducts - пустое состояние
- ✅ UzumOrders - пустое состояние
- ✅ UzumFinance - пустое состояние
- Все следуют template: Icon + Title (1 line) + Subtitle (1-2 lines) + Button

### ШАГ 4: Контекстные tooltips ✅
- ✅ ContextualTooltip.tsx (174 строк)
- ✅ Развернуты 8 tooltips (Калькулятор: 4, Dashboard: 1, Finance: 3)
- Иконка ⓘ с hover/click explanations

### ШАГ 5: ПРОПУЩЕН (по запросу пользователя)

### ШАГ 6: Контекстный FAQ ✅
- ✅ ContextualFaqLink.tsx - новый компонент
- ✅ 3 контекстных FAQ links интегрировано (Калькулятор: 2, Комиссии: 1)
- Функция auto-search и scroll-to-center

### ШАГ 7: Micro-texts ✅
- ✅ 2 friendly micro-texts добавлено
  - "🔐 Код нужен для входа в систему" (login screen)
  - "👋 Мы поможем разобраться и начать продажи" (home screen)

---

## ⚠️ ВЫЯВЛЕННЫЕ ПРОБЕЛЫ (GAPS)

### ПРОБЕЛ 1: FAQ Управление
**Текущее состояние:**
- ✅ Таблица FAQ существует с полями: question_ru, question_uz, answer_ru, answer_uz, sort
- ✅ CRUD в App.tsx (adminSaveFaq, adminDeleteFaq)
- ❌ **Отсутствует:** Поле `slug` или `key` для контекстного связывания
- ❌ **Отсутствует:** Поле `category` для группировки (калькулятор, комиссии, etc)
- ❌ **Отсутствует:** Context mapping в ContextualFaqLink для поиска

**Для ШАГ 6 требуется:**
- Миграция: добавить nullable `slug` и `category` в faq
- Admin UI: поле slug в форме создания FAQ
- Логика: ContextualFaqLink ищет по slug в контексте

### ПРОБЕЛ 2: Microcopy управление
**Текущее состояние:**
- ✅ Micro-texts добавлены hardcoded в App.tsx (2 места)
- ❌ **Отсутствует:** Таблица для хранения micro-texts
- ❌ **Отсутствует:** Admin UI для редактирования micro-texts
- ❌ **Отсутствует:** Система для изменения текстов без редактирования кода

**Для ШАГ 7 требуется:**
- Новая таблица `microcopy` (key, text_ru, text_uz)
- Admin UI с формой редактирования
- Функция loadMicrocopy() для загрузки из БД

### ПРОБЕЛ 3: User Management интеграция
**Текущее состояние:**
- ✅ Таблица users существует
- ✅ Компонент UsersManagement.tsx существует (не интегрирован!)
- ❌ **Отсутствует:** Tab "users" в админке
- ❌ **Отсутствует:** Вызов UsersManagement в admin routes
- ❌ **Отсутствует:** Кнопка в админ-меню для перехода на users

**Для production требуется:**
- Добавить tab "users" в adminTab state
- Добавить button в админ-меню: "👥 Пользователи" (OWNER only)
- Интегрировать UsersManagement компонент
- Проверить API endpoints в api.ts

### ПРОБЕЛ 4: Audit Logging
**Текущее состояние:**
- ✅ Таблица audit_log существует
- ❌ **Отсутствует:** Логирование любых действий
- ❌ **Отсутствует:** API функции для записи в audit_log
- ❌ **Отсутствует:** Admin UI для просмотра audit_log
- ❌ **Отсутствует:** Контроль целостности (кто что изменил и когда)

**Для production требуется:**
- Функция logAction(user_id, action, resource_type, resource_id, details)
- Вызовы в каждой функции: adminSaveSection, adminSaveCard, etc
- Tab "audit" в админке для просмотра истории
- Фильтры по дате, пользователю, типу действия

### ПРОБЕЛ 5: Settings/Configuration управление
**Текущее состояние:**
- ❌ **Отсутствует:** Таблица settings
- ❌ **Отсутствует:** Admin UI для конфига приложения
- ❌ **Отсутствует:** Механизм для изменения env-переменных без redeploy

**Для production требуется:**
- Таблица `settings` (key, value_type, value_ru, value_uz)
- Admin UI с CRUD
- Функция getSettings() для загрузки конфига
- Примеры: welcome_text, FAQ_category, etc

### ПРОБЕЛ 6: RBAC в localStorage (Security Issue)
**Текущее состояние:**
- ❌ Роли хранятся в localStorage и могут быть подделаны
- ❌ Нет сервер-side проверок
- ❌ Нет JWT токена для валидации

**Для production требуется:**
- Реализовать JWT token на сервере (Cloudflare Functions)
- Сохранять token в httpOnly cookie (не localStorage)
- Проверять token на каждом API запросе
- Валидировать роли на сервере, не на клиенте

### ПРОБЕЛ 7: Access Codes - расширенные возможности
**Текущее состояние:**
- ✅ AccessCodesManagement.tsx работает
- ✅ Таблица access_codes имеет max_uses, expires_at, note
- ❌ **Отсутствует:** Валидация max_uses (может быть переиспользован)
- ❌ **Отсутствует:** Валидация expires_at (может быть просроченным)
- ❌ **Отсутствует:** Rate limiting при проверке кода
- ❌ **Отсутствует:** Поле display_code используется не оптимально

**Для production требуется:**
- Сервер-side валидация max_uses/uses_count
- Проверка expires_at перед принятием кода
- Rate limiting (макс 3 попытки за 5 минут)
- Логирование попыток использования кодов в audit_log

### ПРОБЕЛ 8: Content Localization
**Текущее состояние:**
- ✅ Все таблицы имеют _ru и _uz поля
- ✅ Frontend поддерживает RU/UZ переключение
- ❌ **Отсутствует:** Admin UI для выбора активного языка
- ❌ **Отсутствует:** Проверка заполнения обоих языков перед сохранением

**Для production требуется:**
- Валидация: обязательно заполнить оба языка (RU и UZ)
- Предупреждение в UI если один язык пуст
- Settings для выбора default language (RU или UZ)

---

## 📋 ИТОГОВАЯ ТАБЛИЦА: ТЕКУЩЕЕ СОСТОЯНИЕ vs ТРЕБОВАНИЯ

| Функция | Таблица | Текущее | Требуется | Статус | Комментарий |
|---------|---------|---------|-----------|--------|------------|
| Sections CRUD | sections | ✅ | ✅ | ✅ | Работает, есть RBAC |
| Cards CRUD | cards | ✅ | ✅ | ✅ | Работает, есть RBAC |
| News CRUD | news | ✅ | ✅ | ✅ | Работает, есть RBAC |
| FAQ CRUD | faq | ✅ | ✅ | ✅ | Работает, НО отсутствует slug/category |
| Access Codes | access_codes | ✅ | ✅ | ⚠️ | Работает, но нет валидации max_uses/expires_at |
| Users Management | users | ⚠️ | ✅ | ❌ | Компонент есть, не интегрирован |
| Audit Logging | audit_log | ❌ | ✅ | ❌ | Таблица есть, логирование не реализовано |
| Settings | settings | ❌ | ✅ | ❌ | Таблица не создана |
| Microcopy | microcopy | ❌ | ✅ | ❌ | Hardcoded, нет таблицы |
| FAQ Categories | faq | ⚠️ | ✅ | ❌ | Отсутствует поле category |
| RBAC Security | - | ❌ | ✅ | ❌ | localStorage, нет JWT |
| User Sessions | user_sessions | ⚠️ | ✅ | ❌ | Таблица есть, не используется |

---

## 🎯 РЕКОМЕНДАЦИИ (в порядке приоритета)

### ВЫСОКИЙ ПРИОРИТЕТ (для production)
1. **Интегрировать Users Management** - добавить tab "users" в админке
2. **Включить Audit Logging** - логировать все CRUD операции
3. **Улучшить Access Codes** - валидация max_uses, expires_at, rate limiting
4. **Сделать RBAC безопасной** - JWT вместо localStorage

### СРЕДНИЙ ПРИОРИТЕТ (для ШАГ 1-7 и UX)
1. **FAQ с categories/slug** - для ContextualFaqLink (ШАГ 6)
2. **Таблица Microcopy** - для управления micro-texts (ШАГ 7)
3. **Settings таблица** - для конфигурации приложения

### НИЗКИЙ ПРИОРИТЕТ (nice to have)
1. Интегрировать manual_sections в админку
2. Добавить управление telegram_subscribers
3. Расширенные фильтры в audit_log

---

## 📝 NOTES

- **Миграции:** Все созданы в `/migrations/` папке
- **API Client:** Подготовлен в `src/lib/api.ts` но не полностью используется
- **RLS Политики:** На данный момент разрешены все операции (`USING (true)`)
- **Deployment:** Cloudflare Pages Functions в `functions/api/`
- **Tokens:** Сейчас localStorage-based, нужно JWT на Cloudflare Workers

---

## ✅ NEXT STEPS (ШАГ 0+ результат)

После инвентаризации план действий:

1. **Интеграция Users Management** (1-2 часа)
2. **FAQ Миграция** - добавить slug/category (1 час)
3. **Microcopy Таблица** - создать и интегрировать (1-2 часа)
4. **Audit Logging** - реализовать логирование (2-3 часа)
5. **Access Codes Validation** - улучшить валидацию (1-2 часа)
6. **RBAC & JWT** - безопасность (3-4 часа)

**Всего время на закрытие всех gaps: ~12-18 часов работы**
