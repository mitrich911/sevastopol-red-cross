import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, CheckCircle2, Printer, AlertCircle } from 'lucide-react';
import { img } from '../data/content';
import { site } from '../config/site';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`logo${light ? ' logo--light' : ''}`}>
      <svg className="logo__mark" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="12" fill="#fff" />
        <path fill="#D52B1E" d="M18 7h12v11h11v12H30v11H18V30H7V18h11z" />
      </svg>
      <span className="logo__text">
        <strong>Красный Крест</strong>
        <small>Севастополь · служба милосердия</small>
      </span>
    </span>
  );
}

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.name}` : `${site.unit} — ${site.name}`;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}

export function PageHero({ title, lead, photo, children }: { title: string; lead?: string; photo?: string; children?: ReactNode }) {
  return (
    <section className={`page-hero${photo ? ' page-hero--photo' : ''}`}>
      {photo && <img className="page-hero__bg" src={img(photo, 1600, 700)} alt="" />}
      <div className="container page-hero__inner">
        <h1>{title}</h1>
        {lead && <p className="page-hero__lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, lead, center }: { eyebrow?: string; title: string; lead?: string; center?: boolean }) {
  return (
    <div className={`section-head${center ? ' section-head--center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {lead && <p>{lead}</p>}
    </div>
  );
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <div className="accordion">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div className={`accordion__item${isOpen ? ' is-open' : ''}`} key={it.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${base}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{it.q}</span>
                <ChevronDown aria-hidden="true" />
              </button>
            </h3>
            <div id={`${base}-${i}`} className="accordion__panel" role="region" hidden={!isOpen}>
              <p>{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (id: string, describedBy?: string) => ReactNode;
};

export function Field({ label, error, hint, required, children }: FieldProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {hint && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {children(id, describedBy)}
      {error && (
        <p className="field__error" id={`${id}-err`} role="alert">
          <AlertCircle aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

export function SuccessCard({ title, number, text, children }: { title: string; number: string; text: ReactNode; children?: ReactNode }) {
  return (
    <div className="success" role="status" aria-live="polite">
      <CheckCircle2 className="success__icon" aria-hidden="true" />
      <h2>{title}</h2>
      <p className="success__number">
        Номер обращения: <strong>{number}</strong>
      </p>
      <div className="success__text">{text}</div>
      <div className="success__actions">
        <button type="button" className="btn btn--ghost" onClick={() => window.print()}>
          <Printer aria-hidden="true" /> Распечатать
        </button>
        {children}
        <Link to="/" className="btn btn--light">На главную</Link>
      </div>
    </div>
  );
}

export function Consent({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div className={`field field--check${error ? ' has-error' : ''}`}>
      <label className="check">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>
          Я даю согласие на обработку персональных данных в соответствии с{' '}
          <Link to="/privacy" target="_blank">политикой конфиденциальности</Link>
          <span className="req" aria-hidden="true"> *</span>
        </span>
      </label>
      {error && (
        <p className="field__error" role="alert">
          <AlertCircle aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}
