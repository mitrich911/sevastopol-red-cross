# Патронажная служба и служба милосердия — Севастопольский Красный Крест

Сайт службы: услуги, порядок получения помощи, перечень документов, раздел для волонтёров,
контакты и онлайн-заявка. React + Vite + TypeScript, адаптивная вёрстка, режим крупного текста и высокой контрастности.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # сборка в dist/
```

## Что заменить перед запуском

* **Контакты, адрес, часы работы, координаты карты, мессенджеры** — `src/config/site.ts`
  (сейчас там временные значения).
* **Тексты услуг, документов, FAQ, фото** — `src/data/content.ts`.
* **Индексация поисковиками** закрыта (`<meta name="robots" content="noindex">` в `index.html`
  и `public/robots.txt`). Уберите после согласования содержимого.

## Приём заявок (Telegram и MAX)

Формы (заявка, анкета волонтёра, обратная связь) отправляют данные на адрес из переменной
`VITE_FORMS_ENDPOINT`. Пока он не задан, обращение получает номер и подтверждение, но **никуда
не отправляется** (в браузере сохраняется только номер и дата).

Готовый приёмник — `server/worker.js`. Он пересылает каждое обращение (и приложенные файлы)
в Telegram, в MAX или в оба сразу — канал включается, когда для него заданы ключи.
Заявка считается принятой, если дошла хотя бы в один канал.

| Переменная | Канал | Что это |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram | токен бота от [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | Telegram | id чата администраторов |
| `MAX_BOT_TOKEN` | MAX | токен бота: [платформа MAX для партнёров](https://business.max.ru) → Чат-боты → Интеграция |
| `MAX_CHAT_ID` или `MAX_USER_ID` | MAX | id группового чата администраторов (бот должен быть в нём) или пользователя для личных сообщений |
| `MAX_API_URL` | MAX | необязательно, по умолчанию `https://platform-api.max.ru` |
| `ALLOWED_ORIGIN` | общее | адрес сайта, например `https://mitrich911.github.io` |

### Вариант 1: Cloudflare Workers (бесплатно)

1. В Cloudflare → Workers создайте Worker и вставьте код `server/worker.js`.
2. В настройках Worker добавьте секреты и переменные из таблицы.
3. В GitHub: **Settings → Secrets and variables → Actions → Variables** создайте
   `VITE_FORMS_ENDPOINT` = адрес Worker'а и перезапустите workflow (Actions → Deploy → Run workflow).

### Вариант 2: свой сервер (Node 20+)

```bash
MAX_BOT_TOKEN=... MAX_CHAT_ID=... ALLOWED_ORIGIN=https://mitrich911.github.io PORT=8787 node server/node-server.mjs
```

Сервер нужно открыть по HTTPS (например, через nginx) и указать его адрес в `VITE_FORMS_ENDPOINT`.

> **Про сертификат MAX.** MAX переводит API на хост `platform-api2.max.ru` с сертификатом
> Минцифры, которому Cloudflare и большинство зарубежных серверов не доверяют. Пока работает
> `platform-api.max.ru` (общепризнанный сертификат) — используется он. Если старый хост отключат,
> запустите вариант 2 и укажите
> `MAX_API_URL=https://platform-api2.max.ru NODE_EXTRA_CA_CERTS=/путь/russian_trusted_root_ca.pem`
> (сертификат — на [Госуслугах](https://www.gosuslugi.ru/crt)).

Токены хранятся только на сервере и никогда не попадают в код сайта.
Формат запроса (`multipart/form-data`: поле `payload` с JSON и поля `files`) можно принимать
и любым другим backend'ом или CRM.

## Публикация

GitHub Actions (`.github/workflows/deploy.yml`) собирает сайт и публикует на GitHub Pages
при каждом push в `main`.
