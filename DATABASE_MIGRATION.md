# Миграция базы данных

## Добавление колонки image_url в таблицу news

Выполните эту SQL команду в Supabase SQL Editor:

```sql
-- Добавить колонку image_url в таблицу news
ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Если нужно сделать её обязательной (не рекомендуется для существующих данных):
-- ALTER TABLE news ALTER COLUMN image_url SET NOT NULL;

-- Проверка
SELECT * FROM news LIMIT 1;
```

### Пошаговая инструкция:

1. Откройте [console.supabase.com](https://console.supabase.com)
2. Выберите ваш проект
3. Перейдите в `SQL Editor`
4. Нажмите `New Query`
5. Вставьте SQL код выше
6. Нажмите `Run`

После выполнения колонка `image_url` будет добавлена в таблицу `news`.

## Структура таблицы news (после миграции)

```
Column          Type            Nullable
id              uuid            No (Primary Key)
title_ru        text            No
title_uz        text            No
body_ru         text            No
body_uz         text            No
published_at    date            No
pinned          boolean         Yes
image_url       text            Yes (NEW)
created_at      timestamp       Yes
```

## Как используется:

- **image_url** - URL на изображение (например: https://example.com/image.jpg)
- При добавлении новости через админ панель указывается URL
- Картинка отображается в списке новостей
- При добавлении новости отправляется в Telegram канал вместе с текстом
