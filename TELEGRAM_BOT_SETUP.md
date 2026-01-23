# Настройка Telegram бота для отправки уведомлений

## Шаг 1: Создание бота через BotFather

1. Откройте Telegram и найдите `@BotFather`
2. Напишите команду `/newbot`
3. Следуйте инструкциям:
   - Дайте имя боту (например: `MyApp News Bot`)
   - Дайте юзернейм боту (должен заканчиваться на `bot`, например: `myapp_news_bot`)
4. Скопируйте полученный **Bot Token** (например: `123456789:ABCDefGHIjklMNOPqrstUvwxYZ-_-1234567`)

## Шаг 2: Получение Chat ID

### Вариант A: Использование своего аккаунта
1. Создайте приватный канал в Telegram (например: `@MyAppNews`)
2. Добавьте вашего бота в канал (администратор)
3. Используйте этот код в браузере консоли:
```javascript
// Отправьте боту сообщение через Web API
fetch('https://api.telegram.org/bot{YOUR_BOT_TOKEN}/sendMessage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: -100, // Это будет обновлено после первого сообщения
    text: 'test'
  })
})
// Затем проверьте: https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates
// В ответе найдите поле "chat": { "id": "ваш_chat_id" }
```

### Вариант B: Простой способ
1. Добавьте бота в приватный чат
2. Отправьте любое сообщение боту
3. Откройте в браузере: `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
4. В ответе найдите `"id"` из объекта `"chat"` - это ваш Chat ID

**Для приватного канала**: Chat ID будет отрицательным числом, начинающимся с `-100` (например: `-1001234567890`)

## Шаг 3: Добавление переменных окружения

### Локально (для разработки)

Создайте файл `.env` в корне проекта:
```
VITE_TELEGRAM_BOT_TOKEN=123456789:ABCDefGHIjklMNOPqrstUvwxYZ-_-1234567
VITE_TELEGRAM_CHAT_ID=-1001234567890
```

### На Vercel (для продакшена)

1. Откройте ваш проект на [vercel.com](https://vercel.com)
2. Перейдите в `Settings` → `Environment Variables`
3. Добавьте две переменные:
   - Имя: `VITE_TELEGRAM_BOT_TOKEN`
     Значение: `123456789:ABCDefGHIjklMNOPqrstUvwxYZ-_-1234567`
   - Имя: `VITE_TELEGRAM_CHAT_ID`
     Значение: `-1001234567890`
4. Нажмите `Save`
5. Перейдите на вкладку `Deployments` и redeploy проект

## Шаг 4: Тестирование

После добавления новости в админ панели, вы должны получить уведомление в Telegram канал:
- Заголовок новости
- Текст новости
- Картинка (если она добавлена)

## Скрин URL картинки

При добавлении новости указывайте **полный URL** картинки:
```
https://example.com/image.jpg
https://cdn.domain.com/photos/news-123.png
```

Картинка должна быть доступна в интернете и возвращать CORS заголовки.

## Отладка

Если уведомления не приходят:

1. Проверьте Bot Token правильный:
```javascript
fetch('https://api.telegram.org/botYOUR_BOT_TOKEN/getMe')
```

2. Проверьте Chat ID:
```javascript
fetch('https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates')
// Должны быть сообщения с правильным chat_id
```

3. Откройте браузерную консоль (F12) → вкладка `Console`
   - Ищите логи с префиксом `[TELEGRAM]`
   - Проверьте, есть ли ошибки при отправке

4. Убедитесь, что бот имеет права администратора в канале
