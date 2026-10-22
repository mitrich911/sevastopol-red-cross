import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Clock, Eye, ArrowUp } from 'lucide-react';
import { Logo } from './ui';
import { site } from '../config/site';

const nav = [
  { to: '/services', label: 'Услуги' },
  { to: '/help', label: 'Получить помощь' },
  { to: '/documents', label: 'Документы' },
  { to: '/volunteers', label: 'Волонтёрам' },
  { to: '/about', label: 'О нас' },
  { to: '/contacts', label: 'Контакты' },
];

const sizes = ['normal', 'large', 'xlarge'] as const;
type Size = (typeof sizes)[number];

function readPref<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
}

function writePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<Size>(() => readPref('src-size', 'normal'));
  const [contrast, setContrast] = useState(() => readPref<string>('src-contrast', 'off') === 'on');
  const [showTop, setShowTop] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.size = size;
    writePref('src-size', size);
  }, [size]);

  useEffect(() => {
    document.documentElement.dataset.contrast = contrast ? 'on' : 'off';
    writePref('src-contrast', contrast ? 'on' : 'off');
  }, [contrast]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const a11y = (
    <div className="a11y" role="group" aria-label="Настройки отображения">
      <span className="a11y__label">Размер текста:</span>
      {sizes.map((s, i) => (
        <button
          key={s}
          type="button"
          className={`a11y__btn a11y__btn--${i}${size === s ? ' is-active' : ''}`}
          aria-pressed={size === s}
          aria-label={['Обычный текст', 'Крупный текст', 'Очень крупный текст'][i]}
          onClick={() => setSize(s)}
        >
          А
        </button>
      ))}
      <button
        type="button"
        className={`a11y__btn a11y__contrast${contrast ? ' is-active' : ''}`}
        aria-pressed={contrast}
        onClick={() => setContrast(!contrast)}
      >
        <Eye aria-hidden="true" /> <span>Контраст</span>
      </button>
    </div>
  );

  return (
    <>
      <a className="skip-link" href="#main">Перейти к содержанию</a>
      <div className="topbar">
        <div className="container topbar__inner">
          <span className="topbar__item"><MapPin aria-hidden="true" /> {site.address}</span>
          <span className="topbar__item"><Clock aria-hidden="true" /> {site.hours[0].days} {site.hours[0].time}</span>
          {a11y}
        </div>
      </div>
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="header__logo" aria-label="Главная страница">
            <Logo />
          </Link>
          <nav className="nav" aria-label="Основное меню">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className="nav__link">{n.label}</NavLink>
            ))}
          </nav>
          <div className="header__actions">
            <a className="header__phone" href={site.phoneHref}>
              <Phone aria-hidden="true" />
              <span>{site.phone}</span>
            </a>
            <Link to="/apply" className="btn btn--primary btn--sm header__cta">Оставить заявку</Link>
            <button
              type="button"
              className="burger"
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer${open ? ' is-open' : ''}`} id="mobile-menu" aria-hidden={!open}>
        <div className="drawer__backdrop" onClick={() => setOpen(false)} />
        <div className="drawer__panel" role="dialog" aria-label="Меню">
          <nav aria-label="Мобильное меню">
            <NavLink to="/" end className="drawer__link" tabIndex={open ? 0 : -1}>Главная</NavLink>
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className="drawer__link" tabIndex={open ? 0 : -1}>{n.label}</NavLink>
            ))}
          </nav>
          <Link to="/apply" className="btn btn--primary btn--block" tabIndex={open ? 0 : -1}>Оставить заявку</Link>
          <a href={site.phoneHref} className="btn btn--ghost btn--block" tabIndex={open ? 0 : -1}>
            <Phone aria-hidden="true" /> {site.phone}
          </a>
          {a11y}
        </div>
      </div>

      <main id="main">
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="footer">
        <div className="container footer__grid">
          <div className="footer__about">
            <Logo light />
            <p>{site.unit}. Помогаем жителям Севастополя, которым нужна забота и поддержка.</p>
          </div>
          <div>
            <h2 className="footer__title">Разделы</h2>
            <ul className="footer__list">
              {nav.map((n) => (
                <li key={n.to}><Link to={n.to}>{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="footer__title">Контакты</h2>
            <ul className="footer__list footer__contacts">
              <li><Phone aria-hidden="true" /> <a href={site.phoneHref}>{site.phone}</a></li>
              <li><Mail aria-hidden="true" /> <a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><MapPin aria-hidden="true" /> {site.address}</li>
              {site.hours.map((h) => (
                <li key={h.days}><Clock aria-hidden="true" /> {h.days}: {h.time}</li>
              ))}
            </ul>
          </div>
          <div className="footer__cta">
            <h2 className="footer__title">Нужна помощь?</h2>
            <p>Оставьте заявку — мы перезвоним и подробно проконсультируем.</p>
            <Link to="/apply" className="btn btn--primary">Оставить заявку</Link>
          </div>
        </div>
        <div className="container footer__bottom">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <Link to="/privacy">Политика конфиденциальности</Link>
          <span>При угрозе жизни звоните <a href="tel:112">112</a></span>
        </div>
      </footer>

      {pathname !== '/apply' && <Link to="/apply" className="mobile-cta">Оставить заявку</Link>}
      <button
        type="button"
        className={`to-top${showTop ? ' is-visible' : ''}`}
        aria-label="Наверх"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp />
      </button>
    </>
  );
}
