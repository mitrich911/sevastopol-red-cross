import { useState, type FormEvent } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Loader2, PhoneCall } from 'lucide-react';
import { Consent, Field, PageHero, SuccessCard, usePageMeta } from '../components/ui';
import { site } from '../config/site';
import { formatPhone, isEmailValid, isPhoneValid, submitForm } from '../lib/submit';

const topics = ['Вопрос об услугах', 'Помощь для близкого', 'Волонтёрство', 'Благодарность', 'Жалоба или предложение', 'Другое'];

export default function Contacts() {
  usePageMeta('Контакты', 'Телефон, адрес, электронная почта и часы работы патронажной службы. Форма обратной связи.');
  const [form, setForm] = useState({ name: '', contact: '', topic: topics[0], message: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [result, setResult] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Укажите, как к вам обращаться';
    const c = form.contact.trim();
    if (!(isPhoneValid(c) || isEmailValid(c))) e.contact = 'Укажите телефон или адрес электронной почты';
    if (form.message.trim().length < 10) e.message = 'Напишите сообщение (не менее 10 символов)';
    if (!consent) e.consent = 'Необходимо согласие на обработку данных';
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>('.has-error input, .has-error textarea')?.focus();
      return;
    }
    setStatus('sending');
    try {
      const r = await submitForm('feedback', { ...form, consent });
      setResult(r.number);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  const { lat, lon } = site.map;
  const bbox = `${lon - 0.012},${lat - 0.006},${lon + 0.012},${lat + 0.006}`;
  const messengers = Object.entries(site.messengers).filter(([, url]) => url);

  return (
    <>
      <PageHero title="Контакты" lead="Позвоните, напишите или приходите — мы ответим на вопросы и поможем подобрать помощь." />
      <section className="section">
        <div className="container contacts">
          <div className="contact-cards">
            <a className="contact-card" href={site.phoneHref}>
              <span className="icon-badge"><Phone aria-hidden="true" /></span>
              <span><small>Телефон</small><strong>{site.phone}</strong></span>
            </a>
            <a className="contact-card" href={site.hotlineHref}>
              <span className="icon-badge"><PhoneCall aria-hidden="true" /></span>
              <span><small>Горячая линия (бесплатно)</small><strong>{site.hotline}</strong></span>
            </a>
            <a className="contact-card" href={`mailto:${site.email}`}>
              <span className="icon-badge"><Mail aria-hidden="true" /></span>
              <span><small>Электронная почта</small><strong className="break">{site.email}</strong></span>
            </a>
            <div className="contact-card">
              <span className="icon-badge"><MapPin aria-hidden="true" /></span>
              <span><small>Адрес</small><strong>{site.address}</strong></span>
            </div>
            <div className="contact-card contact-card--hours">
              <span className="icon-badge"><Clock aria-hidden="true" /></span>
              <span>
                <small>Часы работы</small>
                {site.hours.map((h) => <span key={h.days} className="hours-row"><b>{h.days}</b> {h.time}</span>)}
              </span>
            </div>
            {messengers.length > 0 && (
              <div className="messengers">
                {messengers.map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">{name}</a>
                ))}
              </div>
            )}
          </div>
          <div className="map">
            <iframe
              title="Карта: как нас найти"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
              loading="lazy"
            />
            <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`} target="_blank" rel="noopener noreferrer" className="map__link">
              Открыть карту в новом окне
            </a>
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container narrow">
          {result ? (
            <SuccessCard title="Сообщение отправлено" number={result} text={<p>Спасибо! Мы ответим вам в течение одного рабочего дня.</p>} />
          ) : (
            <form className="form-card" onSubmit={onSubmit} noValidate>
              <h2>Обратная связь</h2>
              <p className="muted">Задайте вопрос, оставьте отзыв или предложение.</p>
              <div className="form-grid">
                <Field label="Как к вам обращаться" required error={errors.name}>
                  {(id, d) => <input id={id} aria-describedby={d} autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} />}
                </Field>
                <Field label="Телефон или e-mail" required error={errors.contact}>
                  {(id, d) => (
                    <input
                      id={id}
                      aria-describedby={d}
                      value={form.contact}
                      onChange={(e) => {
                        const v = e.target.value;
                        set('contact', /^[+\d\s()-]+$/.test(v) && v.replace(/\D/g, '').length >= 1 ? formatPhone(v) : v);
                      }}
                    />
                  )}
                </Field>
              </div>
              <Field label="Тема">
                {(id) => (
                  <select id={id} value={form.topic} onChange={(e) => set('topic', e.target.value)}>
                    {topics.map((t) => <option key={t}>{t}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Сообщение" required error={errors.message}>
                {(id, d) => <textarea id={id} aria-describedby={d} rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} />}
              </Field>
              <Consent checked={consent} onChange={setConsent} error={errors.consent} />
              {status === 'error' && <p className="form-error" role="alert">Не удалось отправить сообщение. Попробуйте ещё раз или позвоните нам.</p>}
              <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={status === 'sending'}>
                {status === 'sending' ? <><Loader2 className="spin" aria-hidden="true" /> Отправляем…</> : <><Send aria-hidden="true" /> Отправить</>}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
