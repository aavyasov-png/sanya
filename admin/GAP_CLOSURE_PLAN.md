# 🎯 ПЛАН ЗАКРЫТИЯ ПРОБЕЛОВ (GAP CLOSURE PLAN)

**Статус:** ШАГ 0 завершён - инвентаризация готова  
**Следующий этап:** Систематическое закрытие пробелов  
**Подход:** Только расширение существующего кода (NO REWRITES)

---

## 📊 ПРИОРИТИЗАЦИЯ ПРОБЕЛОВ

### БЛОКИРУЮЩИЕ ПРОБЕЛЫ (ШАГ 1-7 + Production)

| # | Пробел | Зависит от | Требует | Время | Статус |
|---|--------|-----------|---------|-------|--------|
| **P1** | FAQ: добавить slug/category | ШАГ 6 | Миграция БД + форма | 1ч | ❌ TODO |
| **P2** | Microcopy: таблица + UI | ШАГ 7 | Миграция БД + компонент | 1.5ч | ❌ TODO |
| **P3** | Users Management интеграция | Production | Добавить tab + button | 0.5ч | ❌ TODO |
| **P4** | Audit Logging реализация | Production | API + логирование во все CRUD | 2ч | ❌ TODO |

### ЗНАЧИТЕЛЬНЫЕ ПРОБЕЛЫ (Production Ready)

| # | Пробел | Требует | Время | Статус |
|---|--------|---------|-------|--------|
| **P5** | Access Codes: валидация | Server-side проверки | 1.5ч | ❌ TODO |
| **P6** | Settings таблица | Миграция + компонент | 1.5ч | ❌ TODO |
| **P7** | RBAC Security (JWT) | Cloudflare Worker + cookie | 3ч | ❌ TODO |

### ДОПОЛНИТЕЛЬНЫЕ ПРОБЕЛЫ (Nice-to-have)

| # | Пробел | Требует | Время | Статус |
|---|--------|---------|-------|--------|
| **P8** | Content validation | Проверки заполнения языков | 0.5ч | ⚠️  BACKLOG |
| **P9** | Rate limiting на кодах | Server-side counter | 1ч | ⚠️  BACKLOG |
| **P10** | Full-text search | PostgreSQL tsvector | 1.5ч | ⚠️  BACKLOG |

---

## 🔧 ПЛАН ЗАКРЫТИЯ ПРОБЕЛОВ (ПО ПОРЯДКУ)

### ШАГ P1: FAQ с slug и category

**Статус:** ❌ NOT STARTED  
**Зависит от:** ШАГ 6 (ContextualFaqLink)  
**Время:** ~1 час  
**Миграция:** 1 файл, ~20 строк SQL  
**Код:** 2 места изменения

#### Что делать:

1. **Миграция БД** - добавить поля в таблицу faq
   ```sql
   -- migrations/003_faq_enhance.sql
   ALTER TABLE faq ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
   ALTER TABLE faq ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
   CREATE INDEX IF NOT EXISTS idx_faq_slug ON faq(slug);
   CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category);
   ```

2. **Admin UI** - добавить поля в форму FAQ
   - Input для slug (автогенерируется из question_ru)
   - Select для category (calculator, commissions, general)

3. **ContextualFaqLink** - уже готов, просто используется
   - Ищет по slug: `findFaqBySlug(slug)`
   - Используется в 3 местах (ШАГ 6 уже сделано)

#### Фаилы для изменения:
- ❌ `migrations/003_faq_enhance.sql` (создать)
- 📝 `src/App.tsx` (добавить поля в faqForm + форму создания)

#### Проверка:
- [ ] Миграция применена
- [ ] FAQ можно создавать со slug
- [ ] ContextualFaqLink работает по slug
- [ ] Backward compatible (старые FAQ без slug работают)

---

### ШАГ P2: Microcopy управление

**Статус:** ❌ NOT STARTED  
**Зависит от:** ШАГ 7 (Micro-texts)  
**Время:** ~1.5 часа  
**Миграция:** 1 файл, ~25 строк SQL  
**Код:** 3 места изменения

#### Что делать:

1. **Миграция БД** - создать таблицу microcopy
   ```sql
   -- migrations/004_microcopy_table.sql
   CREATE TABLE IF NOT EXISTS microcopy (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     key TEXT NOT NULL UNIQUE,
     text_ru TEXT NOT NULL,
     text_uz TEXT NOT NULL,
     context TEXT, -- 'login', 'home', 'uzum', etc
     sort INTEGER DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   
   -- Вставить существующие micro-texts
   INSERT INTO microcopy (key, text_ru, text_uz, context) VALUES
     ('login_info', '🔐 Код нужен для входа в систему', '🔐 Tizimga kirish uchun kod kerak', 'login'),
     ('home_welcome', '👋 Мы поможем разобраться и начать продажи', '👋 Biz boshlamoq va sotishni boshlashga yordam beramiz', 'home');
   ```

2. **Admin UI** - добавить tab "microcopy"
   - Form: key, text_ru, text_uz, context
   - List: все microcopy с редактированием/удалением
   - RBAC: ADMIN+ (как FAQ)

3. **App.tsx** - заменить hardcoded текст на loadMicrocopy()
   ```typescript
   const [microcopy, setMicrocopy] = useState<Record<string, { ru: string; uz: string }>>({});
   
   const loadMicrocopy = async () => {
     const { data } = await supabase.from('microcopy').select('*');
     const map: Record<string, any> = {};
     data?.forEach(item => {
       map[item.key] = { ru: item.text_ru, uz: item.text_uz };
     });
     setMicrocopy(map);
   };
   
   useEffect(() => { loadMicrocopy(); }, []);
   ```

#### Фаилы для изменения:
- ❌ `migrations/004_microcopy_table.sql` (создать)
- 📝 `src/App.tsx` (добавить state, функции, tab, использование)

#### Проверка:
- [ ] Таблица создана с initial данными
- [ ] Можно создавать/редактировать microcopy
- [ ] Тексты загружаются из БД, не hardcoded
- [ ] Оба языка работают (RU + UZ)

---

### ШАГ P3: Users Management интеграция

**Статус:** ❌ NOT STARTED  
**Требует:** 30 минут кода  
**Миграция:** 0 файлов (только интеграция)  
**Код:** 1-2 места изменения

#### Что делать:

1. **Добавить tab в админ меню**
   ```tsx
   {canFullAccess() && (
     <button className="btnGhost" onClick={() => setAdminTab("users")}>
       👥 {t.manageUsers} {/* добавить в T константы */}
     </button>
   )}
   ```

2. **Добавить tab handler**
   ```tsx
   {canFullAccess() && adminTab === "users" && (
     <UsersManagement userRole={userRole} />
   )}
   ```

3. **Импортировать компонент**
   ```tsx
   import UsersManagement from "./components/UsersManagement";
   ```

#### Фаилы для изменения:
- 📝 `src/App.tsx` (добавить import, button, tab handler, T.manageUsers)

#### Проверка:
- [ ] Кнопка "👥 Пользователи" видна только OWNER
- [ ] Tab открывается и показывает UsersManagement
- [ ] Можно редактировать пользователей

---

### ШАГ P4: Audit Logging реализация

**Статус:** ❌ NOT STARTED  
**Требует:** 2 часа кода  
**Миграция:** 0 файлов (таблица уже есть)  
**Код:** 3-4 места изменения

#### Что делать:

1. **Функция логирования в App.tsx**
   ```typescript
   const logAction = async (action: string, resourceType: string, resourceId?: string, details?: any) => {
     try {
       await supabase.from('audit_log').insert({
         user_id: (window as any).currentUserId, // нужно установить
         action,
         resource_type: resourceType,
         resource_id: resourceId,
         details: details || {},
         ip_address: 'client-side', // в production это server
         user_agent: navigator.userAgent,
       });
     } catch (err) {
       console.error('Audit log error:', err);
     }
   };
   ```

2. **Добавить вызовы в CRUD функции**
   ```typescript
   const adminSaveSection = async () => {
     // ... existing code ...
     await logAction('create', 'section', newSection.id, { title: newSection.title_ru });
   };
   
   // Аналогично для adminSaveCard, adminSaveNews, adminSaveFaq, adminSaveCode
   ```

3. **Добавить tab для просмотра audit_log**
   ```tsx
   {canManage() && adminTab === "audit" && (
     <AuditLogViewer />
   )}
   ```

4. **Создать компонент AuditLogViewer**
   ```tsx
   // src/components/AuditLogViewer.tsx
   - Table с колонками: user, action, resource, date, details
   - Фильтр по дате, пользователю, типу действия
   - Экспорт в CSV
   ```

#### Фаилы для изменения:
- ❌ `src/components/AuditLogViewer.tsx` (создать)
- 📝 `src/App.tsx` (добавить logAction, вызовы, tab)

#### Проверка:
- [ ] Каждое действие логируется в audit_log
- [ ] Можно просматривать историю
- [ ] Фильтры работают

---

### ШАГ P5: Access Codes валидация

**Статус:** ❌ NOT STARTED  
**Требует:** 1.5 часа кода  
**Миграция:** 1 файл, ~10 строк  
**Код:** 1-2 места изменения

#### Что делать:

1. **Добавить поле для tracking попыток** (опционально)
   ```sql
   ALTER TABLE access_codes ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
   ALTER TABLE access_codes ADD COLUMN IF NOT EXISTS last_used_by_telegram_id BIGINT;
   ```

2. **Улучшить проверку кода в App.tsx**
   ```typescript
   const verifyCode = async (entered: string) => {
     const codeHash = await hashCode(entered);
     
     const { data, error } = await supabase
       .from('access_codes')
       .select('id,role,is_active,expires_at,max_uses,uses_count')
       .eq('code_hash', codeHash)
       .eq('is_active', true)
       .single();
     
     if (error || !data) {
       showToast(t.invalidCode);
       return;
     }
     
     // НОВОЕ: Валидация max_uses
     if (data.max_uses && data.uses_count >= data.max_uses) {
       showToast('Код исчерпан');
       return;
     }
     
     // НОВОЕ: Валидация expires_at
     if (data.expires_at && new Date(data.expires_at) < new Date()) {
       showToast('Код истёк');
       return;
     }
     
     // Успешно - увеличиваем uses_count
     await supabase
       .from('access_codes')
       .update({
         uses_count: data.uses_count + 1,
         last_used_at: new Date().toISOString(),
       })
       .eq('id', data.id);
     
     // ... rest of verification ...
   };
   ```

3. **Добавить rate limiting (опционально)**
   - localStorage: отслеживать failed attempts
   - Показать cooldown: "Слишком много попыток, попробуйте через N секунд"

#### Фаилы для изменения:
- ❌ `migrations/005_access_codes_tracking.sql` (создать)
- 📝 `src/App.tsx` (улучшить verifyCode function)

#### Проверка:
- [ ] uses_count увеличивается при использовании
- [ ] max_uses соблюдается (код не работает после лимита)
- [ ] expires_at соблюдается (код не работает после даты)
- [ ] Rate limiting работает (макс 3 попытки за 5 минут)

---

### ШАГ P6: Settings таблица и управление

**Статус:** ❌ NOT STARTED  
**Требует:** 1.5 часа кода  
**Миграция:** 1 файл, ~30 строк SQL  
**Код:** 2 места изменения

#### Что делать:

1. **Миграция БД**
   ```sql
   CREATE TABLE IF NOT EXISTS settings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     key TEXT NOT NULL UNIQUE,
     value_type TEXT CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
     value_ru TEXT,
     value_uz TEXT,
     description TEXT,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   
   INSERT INTO settings (key, value_type, value_ru, value_uz, description) VALUES
     ('app_title', 'string', 'Узум Продавец', 'Uzum Sotuvchi', 'App title'),
     ('default_language', 'string', 'ru', 'ru', 'Default language'),
     ('max_code_attempts', 'number', '3', '3', 'Max failed attempts'),
     ('faq_page_size', 'number', '10', '10', 'FAQ items per page');
   ```

2. **Admin UI компонент**
   - Tab "settings" (ADMIN+ only)
   - Table с key, value_ru, value_uz, description
   - Form для добавления/редактирования

3. **App.tsx - использование**
   ```typescript
   const [settings, setSettings] = useState<Record<string, any>>({});
   
   const loadSettings = async () => {
     const { data } = await supabase.from('settings').select('*');
     const map: Record<string, any> = {};
     data?.forEach(item => {
       map[item.key] = item.value_ru; // или value_uz в зависимости от lang
     });
     setSettings(map);
   };
   ```

#### Фаилы для изменения:
- ❌ `migrations/006_settings_table.sql` (создать)
- ❌ `src/components/SettingsEditor.tsx` (создать)
- 📝 `src/App.tsx` (добавить state, loadSettings, tab)

#### Проверка:
- [ ] Таблица создана с дефолтными значениями
- [ ] Можно редактировать settings
- [ ] Settings загружаются при старте
- [ ] Изменения сохраняются в БД

---

### ШАГ P7: RBAC Security (JWT вместо localStorage)

**Статус:** ❌ NOT STARTED  
**Требует:** 3 часа кода (сложнейший)  
**Миграция:** 0 файлов (таблицы уже есть)  
**Код:** Cloudflare Worker + 5-10 мест в App.tsx

#### Что делать:

1. **Cloudflare Worker** (функции/api/auth/verify-code)
   - Генерировать JWT token при успешной верификации кода
   - Сохранять session в user_sessions таблице
   - Возвращать token и установить httpOnly cookie

2. **App.tsx - перейти на JWT**
   ```typescript
   // СТАРОЕ: localStorage
   // localStorage.setItem("user_role", role);
   
   // НОВОЕ: JWT в httpOnly cookie (браузер управляет)
   // API Client автоматически отправляет cookie в каждом запросе
   ```

3. **API Client** - добавить проверку token
   ```typescript
   if (!this.token && !this.isCookieAuth()) {
     throw new Error('Not authenticated');
   }
   ```

4. **Supabase RLS** - включить проверки
   ```sql
   -- Вместо USING (true) использовать:
   USING (auth.uid() = user_id OR auth.role() = 'admin')
   ```

#### Фаилы для изменения:
- 🚀 `functions/api/auth/verify-code.js` (расширить)
- 📝 `src/lib/api.ts` (добавить JWT обработку)
- 📝 `src/App.tsx` (убрать localStorage RBAC)

#### Проверка:
- [ ] JWT token генерируется при login
- [ ] Token сохраняется в httpOnly cookie
- [ ] API запросы автоматически отправляют token
- [ ] Session сохраняется в user_sessions
- [ ] Токен валидируется на сервере
- [ ] localStorage не содержит роль

---

## 📅 РЕКОМЕНДУЕМЫЙ ПОРЯДОК РЕАЛИЗАЦИИ

### НЕДЕЛЯ 1: Основное (ШАГ 1-7 + P1, P2, P3)
```
День 1: P1 - FAQ slug/category      (1 час)
День 2: P2 - Microcopy таблица      (1.5 часа)
День 3: P3 - Users Management       (0.5 часа)
День 3: P4 - Audit Logging (часть 1) (1 час)
День 4: P4 - Audit Logging (часть 2) (1 час)
```

### НЕДЕЛЯ 2: Production-ready (P5, P6, P7)
```
День 1: P5 - Access Codes validate   (1.5 часа)
День 2: P6 - Settings управление    (1.5 часа)
День 3-5: P7 - JWT & Security       (3 часа)
```

**Общее время:** ~12 часов работы

---

## ✅ ОКОНЧАТЕЛЬНЫЙ ЧЕКЛИСТ

### Перед началом
- [ ] ADMIN_GAP.md прочитан и понят
- [ ] ARCHITECTURE.md изучена
- [ ] Миграции подготовлены
- [ ] Backup БД сделан

### Для каждого ШАГа
- [ ] Миграция применена и протестирована
- [ ] Код написан и компилируется
- [ ] UI интегрирован и видимый
- [ ] RBAC проверки работают
- [ ] Логирование включено
- [ ] Оба языка (RU/UZ) работают
- [ ] Тесты прошли (если есть)
- [ ] Коммит сделан

### После завершения всех ШАГов
- [ ] Весь код скомпилирован без ошибок
- [ ] App работает в production режиме
- [ ] Все endpoints доступны
- [ ] RBAC работает как ожидается
- [ ] Audit log полный и точный
- [ ] JWT tokens работают
- [ ] Backward compatible (старые пользователи остаются в системе)

---

## 🎯 SUCCESS CRITERIA

**ШАГ 0 завершён когда:**
✅ ADMIN_GAP.md создан и содержит полный инвентарь  
✅ ARCHITECTURE.md показывает текущую архитектуру  
✅ Все пробелы (P1-P10) идентифицированы и приоритизированы  
✅ План закрытия составлен и готов к выполнению  

**Проект ready for production когда:**
✅ P1-P7 закрыты  
✅ Все тесты прошли  
✅ Backward compatible с существующими данными  
✅ Security audit пройден  
✅ Performance acceptable (<500ms для всех операций)  
✅ Все документация актуальна  
