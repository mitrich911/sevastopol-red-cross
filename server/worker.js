/**
 * Приём заявок с сайта → уведомление в Telegram.
 * Cloudflare Worker (бесплатный тариф). Секреты задаются в панели Cloudflare или через wrangler:
 *   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
 *   TELEGRAM_CHAT_ID   — id чата/группы администраторов
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

async function tg(env, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, { method: 'POST', body });
  if (!res.ok) throw new Error(`Telegram ${method}: ${res.status} ${await res.text()}`);
}

export default {
  async fetch(request, env) {
    const headers = cors(env);
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers });

    try {
      const form = await request.formData();
      const payload = JSON.parse(form.get('payload') || '{}');
      if (!TITLES[payload.kind] || !payload.number) return new Response('Bad request', { status: 400, headers });

      const msg = new FormData();
      msg.append('chat_id', env.TELEGRAM_CHAT_ID);
      msg.append('parse_mode', 'HTML');
      msg.append('text', format(payload));
      await tg(env, 'sendMessage', msg);

      const files = form.getAll('files').filter((f) => typeof f === 'object' && f.size <= MAX_SIZE).slice(0, MAX_FILES);
      for (const file of files) {
        const doc = new FormData();
        doc.append('chat_id', env.TELEGRAM_CHAT_ID);
        doc.append('caption', `Файл к обращению № ${payload.number}`);
        doc.append('document', file, file.name);
        await tg(env, 'sendDocument', doc);
      }

      return Response.json({ ok: true, number: payload.number }, { headers });
    } catch (e) {
      console.error(e);
      return Response.json({ ok: false }, { status: 500, headers });
    }
  },
};
