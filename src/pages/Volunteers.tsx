import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { volunteerDirections, img, photos } from '../data/content';
import { Consent, Field, PageHero, SectionHead, SuccessCard, usePageMeta } from '../components/ui';
import { formatPhone, isEmailValid, isFullName, isPhoneValid, submitForm } from '../lib/submit';

const conditions = [
  'Возраст от 18 лет (с 14 лет — с письменного согласия родителей, на отдельных направлениях)',
  'Готовность уделять помощи хотя бы несколько часов в месяц',
  'Собеседование и вводное обучение, включая основы первой помощи',
  'Соблюдение принципов Красного Креста и конфиденциальности подопечных',
];

const availability = ['Будни днём', 'Будни вечером', 'Выходные', 'По возможности'];

export default function Volunteers() {
  usePageMeta('Волонтёрам', 'Станьте волонтёром службы милосердия: помощь пожилым, доставка, автоволонтёрство, мероприятия.');
  const [form, setForm] = useState({ name: '', phone: '', email: '', age: '', directions: [] as string[], time: '', about: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [result, setResult] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string | string[]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleDir = (d: string) =>
    set('directions', form.directions.includes(d) ? form.directions.filter((x) => x !== d) : [...form.directions, d]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isFullName(form.name)) e.name = 'Укажите фамилию и имя';
    if (!isPhoneValid(form.phone)) e.phone = 'Укажите номер телефона полностью';
    if (form.email && !isEmailValid(form.email)) e.email = 'Проверьте адрес электронной почты';
    const age = Number(form.age);
    if (!form.age || age < 14 || age > 100) e.age = 'Укажите возраст от 14 лет';
    if (!form.directions.length) e.directions = 'Выберите хотя бы одно направление';
    if (!consent) e.consent = 'Необходимо согласие на обработку данных';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      document.querySelector<HTMLElement>('.has-error input, .has-error textarea')?.focus();
      return;
    }
    setStatus('sending');
    try {
      const r = await submitForm('volunteer', { ...form, consent });
      setResult(r.number);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <PageHero title="Волонтёрам" lead="Добрые дела не требуют особых навыков — только желания помогать. Присоединяйтесь к команде добровольцев." photo={photos.volunteersAlt} />

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Направления" title="Чем можно помочь" center />
          <div className="grid grid--3">
            {volunteerDirections.map((d) => (
              <div key={d.title} className="feature feature--card">
                <span className="icon-badge icon-badge--soft"><d.icon aria-hidden="true" /></span>
                <div>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container split split--center">
          <div>
            <SectionHead eyebrow="Условия участия" title="Как стать волонтёром" />
            <ul className="checklist">
              {conditions.map((c) => <li key={c}><CheckCircle2 aria-hidden="true" /> {c}</li>)}
            </ul>
            <p>Волонтёрам выдаётся книжка добровольца, ведётся учёт часов. Мы обучаем, поддерживаем и благодарим за помощь.</p>
          </div>
          <img className="rounded-img" src={img(photos.volunteers, 800, 600)} srcSet={`${img(photos.volunteers, 480, 360)} 480w, ${img(photos.volunteers, 800, 600)} 800w`} sizes="(max-width: 900px) 100vw, 50vw" alt="Волонтёры собирают наборы помощи" loading="lazy" />
        </div>
      </section>

      <section className="section" id="volunteer-form">
        <div className="container narrow">
          {result ? (
            <SuccessCard
              title="Спасибо, что хотите помогать!"
              number={result}
              text={<p>Координатор волонтёров свяжется с вами в ближайшее время, расскажет о направлениях и пригласит на встречу.</p>}
            />
          ) : (
            <form className="form-card" onSubmit={onSubmit} noValidate>
              <SectionHead title="Анкета волонтёра" lead="Заполните анкету — координатор свяжется с вами." />
              <div className="form-grid">
                <Field label="Фамилия и имя" required error={errors.name}>
                  {(id, d) => <input id={id} aria-describedby={d} autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} />}
                </Field>
                <Field label="Возраст" required error={errors.age}>
                  {(id, d) => <input id={id} aria-describedby={d} type="number" inputMode="numeric" min={14} max={100} value={form.age} onChange={(e) => set('age', e.target.value)} />}
                </Field>
                <Field label="Телефон" required error={errors.phone}>
                  {(id, d) => <input id={id} aria-describedby={d} type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={(e) => set('phone', formatPhone(e.target.value))} />}
                </Field>
                <Field label="Электронная почта" error={errors.email}>
                  {(id, d) => <input id={id} aria-describedby={d} type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} />}
                </Field>
              </div>

              <fieldset className={`field${errors.directions ? ' has-error' : ''}`}>
                <legend>Интересующие направления <span className="req" aria-hidden="true">*</span></legend>
                <div className="option-grid">
                  {volunteerDirections.map((d) => (
                    <label key={d.title} className={`option${form.directions.includes(d.title) ? ' is-checked' : ''}`}>
                      <input type="checkbox" checked={form.directions.includes(d.title)} onChange={() => toggleDir(d.title)} />
                      <span>{d.title}</span>
                    </label>
                  ))}
                </div>
                {errors.directions && <p className="field__error" role="alert">{errors.directions}</p>}
              </fieldset>

              <fieldset className="field">
                <legend>Когда удобно помогать</legend>
                <div className="chips">
                  {availability.map((a) => (
                    <label key={a} className={`chip${form.time === a ? ' is-active' : ''}`}>
                      <input type="radio" name="time" className="sr-only" checked={form.time === a} onChange={() => set('time', a)} />
                      {a}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field label="Расскажите о себе" hint="Опыт, навыки, наличие автомобиля — всё, что считаете важным">
                {(id, d) => <textarea id={id} aria-describedby={d} rows={4} value={form.about} onChange={(e) => set('about', e.target.value)} />}
              </Field>

              <Consent checked={consent} onChange={setConsent} error={errors.consent} />

              {status === 'error' && <p className="form-error" role="alert">Не удалось отправить анкету. Проверьте подключение к интернету и попробуйте ещё раз.</p>}
              <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={status === 'sending'}>
                {status === 'sending' ? <><Loader2 className="spin" aria-hidden="true" /> Отправляем…</> : <><Send aria-hidden="true" /> Отправить анкету</>}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
