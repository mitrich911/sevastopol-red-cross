import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Users, Check, ArrowRight } from 'lucide-react';
import { categories, services, photos, type ServiceCategory } from '../data/content';
import { PageHero, usePageMeta } from '../components/ui';

export default function Services() {
  usePageMeta('Наши услуги', 'Патронажный уход, помощь пожилым и маломобильным, социально-бытовая поддержка, сопровождение, психологическая помощь.');
  const [cat, setCat] = useState<ServiceCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const { hash } = useLocation();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter(
      (s) =>
        (cat === 'all' || s.category === cat) &&
        (!q || [s.title, s.short, s.description, ...s.forWhom].join(' ').toLowerCase().includes(q)),
    );
  }, [cat, query]);

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('is-highlighted');
        setTimeout(() => el.classList.remove('is-highlighted'), 2000);
      }, 50);
    }
  }, [hash]);

  return (
    <>
      <PageHero
        title="Наши услуги"
        lead="Помогаем дома и вне дома. Подберём помощь под вашу ситуацию — уточнить детали можно на бесплатной консультации."
        photo={photos.care}
      />
      <section className="section">
        <div className="container">
          <div className="filters">
            <div className="chips" role="group" aria-label="Категории услуг">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`chip${cat === c.value ? ' is-active' : ''}`}
                  aria-pressed={cat === c.value}
                  onClick={() => setCat(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label className="search">
              <Search aria-hidden="true" />
              <span className="sr-only">Поиск по услугам</span>
              <input type="search" placeholder="Найти услугу…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>

          <p className="results-count" aria-live="polite">Найдено услуг: {list.length}</p>

          {list.length === 0 ? (
            <div className="empty">
              <p>По вашему запросу ничего не найдено. Опишите ситуацию в заявке — мы подберём подходящую помощь.</p>
              <button type="button" className="btn btn--ghost" onClick={() => { setQuery(''); setCat('all'); }}>Сбросить фильтры</button>
            </div>
          ) : (
            <div className="grid grid--2">
              {list.map((s) => (
                <article key={s.id} id={s.id} className="service-card">
                  <header className="service-card__head">
                    <span className="icon-badge"><s.icon aria-hidden="true" /></span>
                    <h2>{s.title}</h2>
                  </header>
                  <p>{s.description}</p>
                  <div className="service-card__cols">
                    <div>
                      <h3><Users aria-hidden="true" /> Кому подходит</h3>
                      <ul>{s.forWhom.map((f) => <li key={f}>{f}</li>)}</ul>
                    </div>
                    <div>
                      <h3><Check aria-hidden="true" /> Что входит</h3>
                      <ul>{s.includes.map((f) => <li key={f}>{f}</li>)}</ul>
                    </div>
                  </div>
                  <Link to={`/apply?service=${s.id}`} className="btn btn--primary service-card__btn">
                    Подать заявку <ArrowRight aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          )}

          <aside className="note">
            Перечень и условия предоставления услуг уточняются на консультации. Если нужной помощи нет в списке —
            опишите ситуацию в <Link to="/apply">заявке</Link>, и мы постараемся помочь.
          </aside>
        </div>
      </section>
    </>
  );
}
