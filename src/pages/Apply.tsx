import { useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, Paperclip, Pencil, Send, ShieldCheck, Trash2, Upload, User, Users } from 'lucide-react';
import { services } from '../data/content';
import { Consent, Field, SuccessCard, usePageMeta } from '../components/ui';
import { contactMethods, site, type ContactMethod } from '../config/site';
import { formatPhone, isEmailValid, isFullName, isPhoneValid, submitForm } from '../lib/submit';

const stepTitles = ['Получатель помощи', 'Необходимая помощь', 'Контакты', 'Документы', 'Проверка'];
const urgencies = ['В плановом порядке', 'В ближайшие дни', 'Срочно'];
const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

type Form = {
  forWhom: 'self' | 'relative';
  recipient: string;
  recipientAge: string;
  applicant: string;
  relation: string;
  services: string[];
  urgency: string;
  situation: string;
  phone: string;
  address: string;
  method: ContactMethod;
  email: string;
  callTime: string;
};

const sizeLabel = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} МБ` : `${Math.max(1, Math.round(b / 1024))} КБ`);

export default function Apply() {
  usePageMeta('Заявка на помощь', 'Онлайн-заявка на патронажный уход и социальную помощь в Севастополе.');
  const [params] = useSearchParams();
  const preset = services.find((s) => s.id === params.get('service'));

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({
    forWhom: 'self',
    recipient: '',
    recipientAge: '',
    applicant: '',
    relation: '',
    services: preset ? [preset.id] : [],
    urgency: urgencies[0],
    situation: '',
    phone: '',
    address: '',
    method: 'phone',
    email: '',
    callTime: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [result, setResult] = useState<{ number: string } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!isFullName(form.recipient)) e.recipient = 'Укажите фамилию и имя получателя помощи';
      if (form.recipientAge && (Number(form.recipientAge) < 1 || Number(form.recipientAge) > 120)) e.recipientAge = 'Проверьте возраст';
      if (form.forWhom === 'relative' && !isFullName(form.applicant)) e.applicant = 'Укажите ваши фамилию и имя';
    }
    if (s === 1) {
      if (!form.services.length) e.services = 'Выберите хотя бы одну услугу';
      if (form.situation.trim().length < 10) e.situation = 'Опишите ситуацию хотя бы в нескольких словах';
    }
    if (s === 2) {
      if (!isPhoneValid(form.phone)) e.phone = 'Укажите номер телефона полностью';
      if (form.address.trim().length < 5) e.address = 'Укажите адрес, где нужна помощь';
      if (form.method === 'email' && !isEmailValid(form.email)) e.email = 'Укажите корректный адрес электронной почты';
    }
    if (s === 4 && !consent) e.consent = 'Без согласия мы не сможем обработать заявку';
    setErrors(e);
    if (Object.keys(e).length) {
      setTimeout(() => document.querySelector<HTMLElement>('.has-error input, .has-error textarea, .has-error button')?.focus(), 0);
      return false;
    }
    return true;
  };

  const goTo = (s: number) => {
    setStep(s);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      topRef.current?.focus({ preventScroll: true });
    }, 0);
  };

  const next = () => validateStep(step) && goTo(step + 1);
  const back = () => goTo(step - 1);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFileError('');
    const incoming = Array.from(list);
    const ok: File[] = [];
    for (const f of incoming) {
      if (!/^(image\/(jpeg|png|webp|heic)|application\/pdf)$/.test(f.type) && !/\.(jpe?g|png|webp|heic|pdf)$/i.test(f.name)) {
        setFileError(`Файл «${f.name}» не подходит: принимаются JPG, PNG, WEBP, HEIC и PDF.`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        setFileError(`Файл «${f.name}» больше 10 МБ.`);
        continue;
      }
      ok.push(f);
    }
    const merged = [...files, ...ok].slice(0, MAX_FILES);
    if (files.length + ok.length > MAX_FILES) setFileError(`Можно приложить не более ${MAX_FILES} файлов.`);
    setFiles(merged);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (step < 4) return next();
    if (!validateStep(4)) return;
    setStatus('sending');
    try {
      const data = {
        ...form,
        services: form.services.map((id) => services.find((s) => s.id === id)?.title || id),
        method: contactMethods.find((m) => m.value === form.method)?.label || form.method,
        consent,
      };
      const r = await submitForm('application', data, files);
      setResult({ number: r.number });
      setStatus('idle');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus('error');
    }
  };

  if (result) {
    return (
      <section className="section apply">
        <div className="container narrow">
          <SuccessCard
            title="Заявка принята"
            number={result.number}
            text={
              <>
                <p>
                  Спасибо, что обратились к нам. Специалист свяжется с вами
                  {form.method === 'email' ? ' по электронной почте' : ` по телефону ${form.phone}`} в течение одного рабочего дня.
                </p>
                <p>Сохраните номер обращения — он пригодится, если вы будете звонить нам. Если ситуация срочная, позвоните: <a href={site.phoneHref}>{site.phone}</a>.</p>
              </>
            }
          >
            <Link to="/documents" className="btn btn--ghost">Перечень документов</Link>
          </SuccessCard>
        </div>
      </section>
    );
  }

  const summary: [string, string, number][] = [
    ['Получатель помощи', `${form.recipient}${form.recipientAge ? `, ${form.recipientAge} лет` : ''}`, 0],
    ...(form.forWhom === 'relative' ? ([['Заявитель', `${form.applicant}${form.relation ? ` (${form.relation})` : ''}`, 0]] as [string, string, number][]) : []),
    ['Услуги', form.services.map((id) => services.find((s) => s.id === id)?.title).join(', '), 1],
    ['Срочность', form.urgency, 1],
    ['Ситуация', form.situation, 1],
    ['Телефон', form.phone, 2],
    ['Адрес', form.address, 2],
    ['Способ связи', `${contactMethods.find((m) => m.value === form.method)?.label}${form.method === 'email' ? `: ${form.email}` : ''}${form.callTime ? `, ${form.callTime}` : ''}`, 2],
    ['Документы', files.length ? files.map((f) => f.name).join(', ') : 'не приложены', 3],
  ];

  return (
    <section className="section apply">
      <div className="container apply__grid">
        <div>
          <div ref={topRef} tabIndex={-1} className="apply__top">
            <h1>Заявка на помощь</h1>
            <p className="muted">Заполнение займёт 3–5 минут. Поля, отмеченные <span className="req">*</span>, обязательны.</p>
          </div>

          <ol className="stepper" aria-label="Этапы заполнения">
            {stepTitles.map((t, i) => (
              <li key={t} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
                <span className="stepper__dot">{i < step ? <Check aria-hidden="true" /> : i + 1}</span>
                <span className="stepper__label">{t}</span>
              </li>
            ))}
          </ol>
          <p className="stepper__mobile">Шаг {step + 1} из {stepTitles.length}: <strong>{stepTitles[step]}</strong></p>

          <form className="form-card" onSubmit={onSubmit} noValidate>
            {step === 0 && (
              <div className="form-step">
                <h2>Кому нужна помощь?</h2>
                <div className="segmented" role="radiogroup" aria-label="Кто обращается">
                  <label className={`segmented__opt${form.forWhom === 'self' ? ' is-checked' : ''}`}>
                    <input type="radio" name="forWhom" checked={form.forWhom === 'self'} onChange={() => set('forWhom', 'self')} />
                    <User aria-hidden="true" /> Мне
                  </label>
                  <label className={`segmented__opt${form.forWhom === 'relative' ? ' is-checked' : ''}`}>
                    <input type="radio" name="forWhom" checked={form.forWhom === 'relative'} onChange={() => set('forWhom', 'relative')} />
                    <Users aria-hidden="true" /> Близкому человеку
                  </label>
                </div>
                <div className="form-grid">
                  <Field label="ФИО получателя помощи" required error={errors.recipient}>
                    {(id, d) => <input id={id} aria-describedby={d} autoComplete={form.forWhom === 'self' ? 'name' : 'off'} placeholder="Иванова Мария Петровна" value={form.recipient} onChange={(e) => set('recipient', e.target.value)} />}
                  </Field>
                  <Field label="Возраст" error={errors.recipientAge}>
                    {(id, d) => <input id={id} aria-describedby={d} type="number" inputMode="numeric" min={1} max={120} value={form.recipientAge} onChange={(e) => set('recipientAge', e.target.value)} />}
                  </Field>
                </div>
                {form.forWhom === 'relative' && (
                  <div className="form-grid">
                    <Field label="Ваше ФИО (заявитель)" required error={errors.applicant}>
                      {(id, d) => <input id={id} aria-describedby={d} autoComplete="name" value={form.applicant} onChange={(e) => set('applicant', e.target.value)} />}
                    </Field>
                    <Field label="Кем вы приходитесь">
                      {(id) => <input id={id} placeholder="Дочь, сын, соседка…" value={form.relation} onChange={(e) => set('relation', e.target.value)} />}
                    </Field>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="form-step">
                <h2>Какая помощь нужна?</h2>
                <fieldset className={`field${errors.services ? ' has-error' : ''}`}>
                  <legend>Вид услуги <span className="req" aria-hidden="true">*</span> <span className="muted">— можно выбрать несколько</span></legend>
                  <div className="option-grid">
                    {services.map((s) => {
                      const on = form.services.includes(s.id);
                      return (
                        <label key={s.id} className={`option option--icon${on ? ' is-checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => set('services', on ? form.services.filter((x) => x !== s.id) : [...form.services, s.id])}
                          />
                          <s.icon aria-hidden="true" />
                          <span>{s.title}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.services && <p className="field__error" role="alert">{errors.services}</p>}
                </fieldset>
                <fieldset className="field">
                  <legend>Насколько срочно</legend>
                  <div className="chips">
                    {urgencies.map((u) => (
                      <label key={u} className={`chip${form.urgency === u ? ' is-active' : ''}`}>
                        <input type="radio" name="urgency" className="sr-only" checked={form.urgency === u} onChange={() => set('urgency', u)} />
                        {u}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label="Опишите ситуацию" required error={errors.situation} hint="Что случилось, какая помощь нужна, как часто. Подробные медицинские сведения можно не указывать — специалист уточнит их лично.">
                  {(id, d) => <textarea id={id} aria-describedby={d} rows={5} maxLength={2000} value={form.situation} onChange={(e) => set('situation', e.target.value)} />}
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <h2>Как с вами связаться?</h2>
                <div className="form-grid">
                  <Field label="Контактный телефон" required error={errors.phone}>
                    {(id, d) => <input id={id} aria-describedby={d} type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={(e) => set('phone', formatPhone(e.target.value))} />}
                  </Field>
                  <Field label="Удобное время для звонка">
                    {(id) => <input id={id} placeholder="Например, после 14:00" value={form.callTime} onChange={(e) => set('callTime', e.target.value)} />}
                  </Field>
                </div>
                <Field label="Адрес оказания помощи" required error={errors.address} hint="Улица, дом, квартира. Для частного сектора — ориентиры.">
                  {(id, d) => <input id={id} aria-describedby={d} autoComplete="street-address" placeholder="г. Севастополь, ул. …" value={form.address} onChange={(e) => set('address', e.target.value)} />}
                </Field>
                <fieldset className="field">
                  <legend>Предпочтительный способ связи</legend>
                  <div className="chips">
                    {contactMethods.map((m) => (
                      <label key={m.value} className={`chip${form.method === m.value ? ' is-active' : ''}`}>
                        <input type="radio" name="method" className="sr-only" checked={form.method === m.value} onChange={() => set('method', m.value)} />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {form.method === 'email' && (
                  <Field label="Электронная почта" required error={errors.email}>
                    {(id, d) => <input id={id} aria-describedby={d} type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} />}
                  </Field>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <h2>Документы</h2>
                <p className="muted">
                  Это необязательный шаг. Вы можете приложить фото или сканы документов, чтобы ускорить
                  рассмотрение, — или принести их на встречу со специалистом.
                </p>
                <div
                  className="dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    addFiles(e.dataTransfer.files);
                  }}
                >
                  <Upload aria-hidden="true" />
                  <p><strong>Перетащите файлы сюда</strong> или</p>
                  <label className="btn btn--ghost">
                    <Paperclip aria-hidden="true" /> Выбрать файлы
                    <input ref={fileRef} type="file" className="sr-only" multiple accept="image/*,.pdf" onChange={(e) => addFiles(e.target.files)} />
                  </label>
                  <small>JPG, PNG, PDF · до 10 МБ · не более {MAX_FILES} файлов</small>
                </div>
                {fileError && <p className="field__error" role="alert">{fileError}</p>}
                {files.length > 0 && (
                  <ul className="file-list">
                    {files.map((f, i) => (
                      <li key={`${f.name}-${i}`}>
                        <Paperclip aria-hidden="true" />
                        <span className="file-list__name">{f.name}</span>
                        <span className="muted">{sizeLabel(f.size)}</span>
                        <button type="button" aria-label={`Удалить файл ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                          <Trash2 aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="form-step">
                <h2>Проверьте данные</h2>
                <dl className="summary">
                  {summary.map(([k, v, s]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                      <button type="button" className="summary__edit" onClick={() => goTo(s)} aria-label={`Изменить: ${k}`}>
                        <Pencil aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </dl>
                <Consent checked={consent} onChange={(v) => { setConsent(v); if (v) setErrors((e) => ({ ...e, consent: '' })); }} error={errors.consent} />
                {status === 'error' && <p className="form-error" role="alert">Не удалось отправить заявку. Проверьте подключение к интернету и попробуйте ещё раз или позвоните нам по телефону {site.phone}.</p>}
              </div>
            )}

            <div className="form-nav">
              {step > 0 ? (
                <button type="button" className="btn btn--ghost" onClick={back}><ArrowLeft aria-hidden="true" /> Назад</button>
              ) : <span />}
              {step < 4 ? (
                <button type="submit" className="btn btn--primary">Далее <ArrowRight aria-hidden="true" /></button>
              ) : (
                <button type="submit" className="btn btn--primary btn--lg" disabled={status === 'sending'}>
                  {status === 'sending' ? <><Loader2 className="spin" aria-hidden="true" /> Отправляем…</> : <><Send aria-hidden="true" /> Отправить заявку</>}
                </button>
              )}
            </div>
          </form>
        </div>

        <aside className="apply__aside">
          <div className="info-card">
            <ShieldCheck aria-hidden="true" />
            <h2>Ваши данные защищены</h2>
            <p>Сведения используются только для связи с вами и организации помощи и не передаются третьим лицам.</p>
          </div>
          <div className="info-card info-card--plain">
            <h2>Удобнее по телефону?</h2>
            <p>Специалист примет заявку и ответит на вопросы.</p>
            <a href={site.phoneHref} className="btn btn--ghost btn--block">{site.phone}</a>
            <p className="muted small">{site.hours.map((h) => `${h.days} ${h.time}`).join(' · ')}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
