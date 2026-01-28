# Telegram Bot для Uzum Seller Bot

Простой Telegram бот с командами для управления MiniApp.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd telegram-bot
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните переменные:
```
TELEGRAM_BOT_TOKEN=123456789:ABCDefGHIjklMNOPqrstUvwxYZ
MINI_APP_URL=https://your-app.vercel.app
```

### 3. Запуск

**Разработка (с автоперезагрузкой):**
```bash
npm run dev
```

**Продакшн:**
```bash
npm start
```

## 📋 Команды бота

### `/start`
Приветственное сообщение с:
- Описанием основных функций
- Инструкцией как открыть MiniApp
- Кнопкой для запуска приложения

### `/help`
Справка по использованию:
- Как открыть приложение
- Как подключить интеграцию
- Как пользоваться калькулятором
- FAQ

### `/app`
Быстрое открытие MiniApp через кнопку

## 🎯 Функции

✅ **Приветствие с кнопкой запуска MiniApp**
- Автоматически показывается при `/start`
- Красивое форматирование с эмодзи
- Inline кнопка для открытия приложения

✅ **Инструкции**
- Краткое описание всех функций
- Пошаговые инструкции
- FAQ

✅ **Обработка ошибок**
- Graceful shutdown
- Логирование ошибок
- Retry механизм для polling

## 🔧 Настройка для продакшена

### Вариант 1: PM2 (рекомендуется)

Установите PM2:
```bash
npm install -g pm2
```

Запустите бота:
```bash
pm2 start bot.js --name uzum-bot
pm2 save
pm2 startup
```

### Вариант 2: Systemd service

Создайте файл `/etc/systemd/system/uzum-bot.service`:

```ini
[Unit]
Description=Uzum Seller Telegram Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/telegram-bot
ExecStart=/usr/bin/node bot.js
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/path/to/telegram-bot/.env

[Install]
WantedBy=multi-user.target
```

Запустите:
```bash
sudo systemctl enable uzum-bot
sudo systemctl start uzum-bot
sudo systemctl status uzum-bot
```

### Вариант 3: Docker

Создайте `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "bot.js"]
```

Запустите:
```bash
docker build -t uzum-bot .
docker run -d --env-file .env --name uzum-bot uzum-bot
```

## 📝 Логи

Бот выводит логи в консоль:
- `✅` - успешные операции
- `❌` - ошибки
- `🤖` - информация о запуске

## 🔒 Безопасность

1. **Никогда не коммитьте `.env` файл**
2. **Храните токен бота в секрете**
3. **Используйте переменные окружения на сервере**

## 📊 Мониторинг

### PM2
```bash
pm2 status
pm2 logs uzum-bot
pm2 monit
```

### Systemd
```bash
sudo journalctl -u uzum-bot -f
```

## 🆘 Поддержка

Если возникли проблемы:
1. Проверьте логи
2. Убедитесь что токен корректный
3. Проверьте доступность API Telegram

## 📚 Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [BotFather](https://t.me/BotFather)
