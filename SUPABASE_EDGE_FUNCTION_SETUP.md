# 🚀 Настройка Supabase Edge Function для Uzum API Proxy

## Проблема
Uzum API не поддерживает CORS, поэтому прямые запросы из браузера блокируются. Cloudflare Workers тоже блокируются Uzum API (403 Forbidden).

## Решение
Используем Supabase Edge Functions как прокси-сервер.

## Шаги для деплоя

### 1. Установите Supabase CLI (если еще не установлен)
```bash
# Linux/macOS
curl -fsSL https://cli.supabase.com | sh

# Windows
scoop install supabase

# Или используйте npx (без глобальной установки)
npx supabase
```

### 2. Залогиньтесь в Supabase
```bash
npx supabase login
```

Или создайте access token вручную:
1. Перейдите на https://supabase.com/dashboard/account/tokens
2. Создайте новый токен
3. Установите переменную окружения:
```bash
export SUPABASE_ACCESS_TOKEN=sbp_xxx...
```

### 3. Задеплойте Edge Function
```bash
cd /workspaces/vite-react2.0
npx supabase functions deploy uzum-proxy --project-ref ykbouygdeqrohizeqlmc
```

### 4. Проверьте работу
Функция будет доступна по адресу:
```
https://ykbouygdeqrohizeqlmc.supabase.co/functions/v1/uzum-proxy
```

Проверьте через curl:
```bash
curl -X POST https://ykbouygdeqrohizeqlmc.supabase.co/functions/v1/uzum-proxy \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "path": "/v1/shops",
    "method": "GET",
    "headers": {
      "Authorization": "YOUR_UZUM_TOKEN"
    }
  }'
```

## Альтернатива: Ручное создание через Dashboard

Если CLI не работает, создайте функцию вручную:

1. Перейдите в https://supabase.com/dashboard/project/ykbouygdeqrohizeqlmc/functions
2. Нажмите "Create a new function"
3. Имя: `uzum-proxy`
4. Скопируйте код из `supabase/functions/uzum-proxy/index.ts`
5. Нажмите "Deploy"

## Файлы проекта

- `supabase/functions/uzum-proxy/index.ts` - код Edge Function
- `src/lib/uzum-api.ts` - клиентский код (уже настроен на использование этого прокси)

## Проверка после деплоя

После успешного деплоя:
1. Соберите проект: `npm run build`
2. Задеплойте на Cloudflare Pages
3. Попробуйте подключить интеграцию с Uzum

## Отладка

Если не работает:
1. Проверьте логи в Supabase Dashboard → Functions → uzum-proxy → Logs
2. Убедитесь, что CORS заголовки настроены правильно
3. Проверьте, что apikey передается в запросах
