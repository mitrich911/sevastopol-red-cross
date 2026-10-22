import { site } from '../config/site';

export type FormKind = 'application' | 'volunteer' | 'feedback';

const prefixes: Record<FormKind, string> = {
  application: 'ЗП',
  volunteer: 'ВЛ',
  feedback: 'ОС',
};

export function makeNumber(kind: FormKind): string {
  const d = new Date();
  const date = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `${prefixes[kind]}-${date}-${rnd}`;
}

export type SubmitResult = { number: string; delivered: boolean };

/**
 * Отправляет обращение на серверный приёмник (VITE_FORMS_ENDPOINT).
 * Пока приёмник не настроен, обращение получает номер и сохраняется
 * только в браузере посетителя, на сервер ничего не уходит.
 */
export async function submitForm(
  kind: FormKind,
  data: Record<string, string | string[] | boolean>,
  files: File[] = [],
): Promise<SubmitResult> {
  const number = makeNumber(kind);
  const payload = { kind, number, createdAt: new Date().toISOString(), data };

  if (site.formsEndpoint) {
    const body = new FormData();
    body.append('payload', JSON.stringify(payload));
    files.forEach((f) => body.append('files', f, f.name));
    const res = await fetch(site.formsEndpoint, { method: 'POST', body });
    if (!res.ok) throw new Error(`Сервер вернул ошибку ${res.status}`);
    return { number, delivered: true };
  }

  await new Promise((r) => setTimeout(r, 700));
  try {
    const key = 'src-submissions';
    const list = JSON.parse(localStorage.getItem(key) || '[]') as { kind: string; number: string; createdAt: string }[];
    // Храним только номер и дату — без персональных данных.
    list.push({ kind, number, createdAt: payload.createdAt });
    localStorage.setItem(key, JSON.stringify(list.slice(-20)));
  } catch {
    /* хранилище недоступно — не критично */
  }
  return { number, delivered: false };
}

export function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits[0] === '8') digits = '7' + digits.slice(1);
  if (digits[0] !== '7') digits = '7' + digits;
  digits = digits.slice(0, 11);
  const p = digits.slice(1);
  let out = '+7';
  if (p.length) out += ' (' + p.slice(0, 3);
  if (p.length >= 3) out += ')';
  if (p.length > 3) out += ' ' + p.slice(3, 6);
  if (p.length > 6) out += '-' + p.slice(6, 8);
  if (p.length > 8) out += '-' + p.slice(8, 10);
  return out;
}

export const isPhoneValid = (v: string) => v.replace(/\D/g, '').length === 11;
export const isEmailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isFullName = (v: string) => v.trim().split(/\s+/).filter((p) => p.length > 1).length >= 2;
