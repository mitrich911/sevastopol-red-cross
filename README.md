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

## Приём заявок (Telegram-бот)

Формы (заявка, анкета волонтёра, обратная связь) отправляют данные на адрес из переменной
`VITE_FORMS_ENDPOINT`. Пока он не задан, обращение получает номер и подтверждение, но **никуда
не отправляется** (в браузере сохраняется только номер и дата).

Готовый приёмник — `server/worker.js` (Cloudflare Workers, бесплатно):

1. Создайте бота у [@BotFather](https://t.me/BotFather), добавьте его в чат администраторов, узнайте id чата.
2. В Cloudflare → Workers создайте Worker и вставьте код `server/worker.js`.
3. В настройках Worker добавьте секреты `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
   и переменную `ALLOWED_ORIGIN` (адрес сайта, например `https://mitrich911.github.io`).
4. В GitHub: **Settings → Secrets and variables → Actions → Variables** создайте
   `VITE_FORMS_ENDPOINT` = адрес Worker'а и перезапустите workflow (Actions → Deploy → Run workflow).

Токен бота хранится только на сервере и никогда не попадает в код сайта.
Тот же формат запроса (`multipart/form-data`: поле `payload` с JSON и поля `files`) можно
принимать любым другим backend'ом или CRM.

## Публикация

GitHub Actions (`.github/workflows/deploy.yml`) собирает сайт и публикует на GitHub Pages
при каждом push в `main`.
