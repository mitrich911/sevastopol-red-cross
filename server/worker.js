/**
 * Приём заявок с сайта → уведомления в Telegram и/или MAX.
 * Работает как Cloudflare Worker (бесплатный тариф) или как Node-сервер (server/node-server.mjs).
 * Канал включается, когда для него заданы ключи; можно включить оба сразу.
 *
 * Telegram:
 *   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
 *   TELEGRAM_CHAT_ID   — id чата/группы администраторов
 * MAX:
 *   MAX_BOT_TOKEN      — токен бота (платформа для партнёров MAX → чат-боты → Интеграция)
 *   MAX_CHAT_ID        — id группового чата администраторов, либо
 *   MAX_USER_ID        — id пользователя для личных сообщений
 *   MAX_API_URL        — адрес API, по умолчанию https://platform-api.max.ru
 * Общее:
 *   ALLOWED_ORIGIN     — адрес сайта, например https://<user>.github.io
 */

const TITLES = {
  application: '🆘 Новая заявка на помощь',
  volunteer: '🤝 Анкета волонтёра',
  feedback: '✉️ Обратная связь',
};

const LABELS = {
  forWhom: 'Кто обращается',
  recipient: 'Получатель помощи',
  recipientAge: 'Возраст',
  applicant: 'Заявитель',
  relation: 'Кем приходится',
  services: 'Услуги',
  urgency: 'Срочность',
  situation: 'Ситуация',
  phone: 'Телефон',
  address: 'Адрес',
  method: 'Способ связи',
  email: 'E-mail',
  callTime: 'Удобное время',
  name: 'Имя',
  age: 'Возраст',
  directions: 'Направления',
  time: 'Когда удобно',
  about: 'О себе',
  contact: 'Контакт',
  topic: 'Тема',
  message: 'Сообщение',
};

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cors(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function format(payload) {
  const lines = [`<b>${TITLES[payload.kind] || 'Обращение'}</b>`, `№ <code>${esc(payload.number)}</code>`, ''];
  for (const [key, value] of Object.entries(payload.data || {})) {
    if (key === 'consent' || value === '' || value == null) continue;
    let v = Array.isArray(value) ? value.join(', ') : value;
    if (key === 'forWhom') v = value === 'relative' ? 'родственник / представитель' : 'сам получатель';
    lines.push(`<b>${esc(LABELS[key] || key)}:</b> ${esc(v)}`);
  }
  return lines.join('\n').slice(0, 4000);
}

/* ---------- Telegram ---------- */

async function tg(env, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, { method: 'POST', body });
  if (!res.ok) throw new Error(`Telegram ${method}: ${res.status} ${await res.text()}`);
}

async function sendTelegram(env, text, number, files) {
  const msg = new FormData();
  msg.append('chat_id', env.TELEGRAM_CHAT_ID);
  msg.append('parse_mode', 'HTML');
  msg.append('text', text);
  await tg(env, 'sendMessage', msg);

  for (const file of files) {
    const doc = new FormData();
    doc.append('chat_id', env.TELEGRAM_CHAT_ID);
    doc.append('caption', `Файл к обращению № ${number}`);
    doc.append('document', file, file.name);
    await tg(env, 'sendDocument', doc);
  }
}

/* ---------- MAX ---------- */

const maxBase = (env) => (env.MAX_API_URL || 'https://platform-api.max.ru').replace(/\/$/, '');

async function maxApi(env, path, init = {}) {
  const res = await fetch(`${maxBase(env)}${path}`, {
    ...init,
    headers: { Authorization: env.MAX_BOT_TOKEN, ...(init.headers || {}) },
  });
  const body = await res.text();
  if (!res.ok) {
    const err = new Error(`MAX ${path}: ${res.status} ${body}`);
    err.notReady = body.includes('attachment.not.ready') || body.includes('not.processed');
    throw err;
  }
  return body ? JSON.parse(body) : {};
}

function maxRecipient(env) {
  return env.MAX_CHAT_ID ? `chat_id=${encodeURIComponent(env.MAX_CHAT_ID)}` : `user_id=${encodeURIComponent(env.MAX_USER_ID)}`;
}

async function maxUpload(env, file) {
  const slot = await maxApi(env, '/uploads?type=file', { method: 'POST' });
  const form = new FormData();
  form.append('data', file, file.name);
  const res = await fetch(slot.url, { method: 'POST', headers: { Authorization: env.MAX_BOT_TOKEN }, body: form });
  if (!res.ok) throw new Error(`MAX upload: ${res.status} ${await res.text()}`);
  const uploaded = await res.json().catch(() => ({}));
  const token = uploaded.token || slot.token;
  if (!token) throw new Error('MAX upload: сервер не вернул token файла');
  return token;
}

async function maxSend(env, message) {
  // Файл обрабатывается на стороне MAX не мгновенно — повторяем с увеличением паузы.
  for (let attempt = 0; ; attempt++) {
    try {
      return await maxApi(env, `/messages?${maxRecipient(env)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (e) {
      if (!e.notReady || attempt >= 4) throw e;
      await sleep(1000 * 2 ** attempt);
    }
  }
}

async function sendMax(env, text, number, files) {
  await maxSend(env, { text, format: 'html' });
  for (const file of files) {
    const token = await maxUpload(env, file);
    await maxSend(env, { text: `Файл к обращению № ${number}`, attachments: [{ type: 'file', payload: { token } }] });
  }
}

/* ---------- Приём ---------- */

function channels(env) {
  const list = [];
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) list.push(['telegram', sendTelegram]);
  if (env.MAX_BOT_TOKEN && (env.MAX_CHAT_ID || env.MAX_USER_ID)) list.push(['max', sendMax]);
  return list;
}

export default {
  async fetch(request, env) {
    const headers = cors(env);
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers });

    const targets = channels(env);
    if (!targets.length) {
      console.error('Не настроен ни один канал: задайте ключи Telegram и/или MAX');
      return Response.json({ ok: false }, { status: 503, headers });
    }

    try {
      const form = await request.formData();
      const payload = JSON.parse(form.get('payload') || '{}');
      if (!TITLES[payload.kind] || !payload.number) return new Response('Bad request', { status: 400, headers });

      const files = form
        .getAll('files')
        .filter((f) => typeof f === 'object' && f.size <= MAX_SIZE)
        .slice(0, MAX_FILES);
      const text = format(payload);

      const results = await Promise.allSettled(targets.map(([, send]) => send(env, text, payload.number, files)));
      const delivered = targets.filter((_, i) => results[i].status === 'fulfilled').map(([name]) => name);
      results.forEach((r, i) => r.status === 'rejected' && console.error(targets[i][0], r.reason));

      // Заявка считается принятой, если дошла хотя бы в один канал.
      if (!delivered.length) return Response.json({ ok: false }, { status: 502, headers });
      return Response.json({ ok: true, number: payload.number, delivered }, { headers });
    } catch (e) {
      console.error(e);
      return Response.json({ ok: false }, { status: 500, headers });
    }
  },
};
