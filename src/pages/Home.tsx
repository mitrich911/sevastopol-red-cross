import { Link } from 'react-router-dom';
import { ArrowRight, Phone, CheckCircle2, HeartPulse } from 'lucide-react';
import { advantages, services, steps, faq, img, photos } from '../data/content';
import { Accordion, SectionHead, usePageMeta } from '../components/ui';
import { site } from '../config/site';

export default function Home() {
  usePageMeta('');
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="hero__badge"><HeartPulse aria-hidden="true" /> {site.unit}</span>
            <h1>Забота, которая действительно помогает</h1>
            <p className="hero__lead">
              Патронажный уход на дому, помощь пожилым и маломобильным людям, сопровождение к врачу
              и поддержка семей в Севастополе.
            </p>
            <div className="hero__actions">
              <Link to="/apply" className="btn btn--primary btn--lg">
                Получить помощь <ArrowRight aria-hidden="true" />
              </Link>
              <Link to="/services" className="btn btn--ghost btn--lg">Наши услуги</Link>
            </div>
            <a href={site.phoneHref} className="hero__phone">
              <span className="hero__phone-icon"><Phone aria-hidden="true" /></span>
              <span>
                <small>Консультация по телефону</small>
                <strong>{site.phone}</strong>
              </span>
            </a>
          </div>
          <div className="hero__media">
            <img
              src={img(photos.hero, 900, 1000)}
              srcSet={`${img(photos.hero, 500, 560)} 500w, ${img(photos.hero, 900, 1000)} 900w`}
              sizes="(max-width: 900px) 100vw, 45vw"
              alt="Сотрудница службы беседует с пожилым человеком"
              fetchPriority="high"
            />
            <div className="hero__card">
              <strong>Индивидуальный план</strong>
              <span>ухода для каждого подопечного</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-short">
          <div className="about-short__media">
            <img src={img(photos.hands, 800, 640)} alt="Руки сотрудницы бережно держат руки пожилого человека" loading="lazy" />
          </div>
          <div>
            <SectionHead eyebrow="О службе" title="Рядом, когда нужна поддержка" />
            <p className="text-lg">
              Патронажная служба и служба милосердия Севастопольского Красного Креста помогают людям,
              которым из-за возраста, болезни или инвалидности трудно справляться самостоятельно.
            </p>
            <p>
              Мы приходим домой, помогаем в быту и уходе, сопровождаем в больницы и поддерживаем
              родственников. В основе нашей работы — принципы гуманности, беспристрастности
              и добровольности.
            </p>
            <ul className="checklist">
              <li><CheckCircle2 aria-hidden="true" /> Бережный уход с уважением к достоинству человека</li>
              <li><CheckCircle2 aria-hidden="true" /> Помощь подбирается под конкретную ситуацию</li>
              <li><CheckCircle2 aria-hidden="true" /> Поддержка не только подопечных, но и их семей</li>
            </ul>
            <Link to="/about" className="link-arrow">Подробнее о нас <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">
          <SectionHead eyebrow="Услуги" title="Чем мы можем помочь" lead="Выберите подходящую помощь — специалист уточнит детали на консультации." center />
          <div className="grid grid--4">
            {services.map((s) => (
              <Link key={s.id} to={`/services#${s.id}`} className="tile">
                <span className="icon-badge"><s.icon aria-hidden="true" /></span>
                <h3>{s.title}</h3>
                <p>{s.short}</p>
                <span className="tile__more">Подробнее <ArrowRight aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Почему нам доверяют" title="Преимущества службы" center />
          <div className="grid grid--3">
            {advantages.map((a) => (
              <div key={a.title} className="feature">
                <span className="icon-badge icon-badge--soft"><a.icon aria-hidden="true" /></span>
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">
          <SectionHead eyebrow="Как получить помощь" title="Семь простых шагов" lead="От заявки до начала обслуживания мы сопровождаем вас на каждом этапе." center />
          <ol className="steps-mini">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="steps-mini__num">{i + 1}</span>
                <strong>{s.title}</strong>
              </li>
            ))}
          </ol>
          <div className="center-actions">
            <Link to="/help" className="btn btn--ghost">Подробнее о порядке</Link>
            <Link to="/apply" className="btn btn--primary">Оставить заявку</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <SectionHead eyebrow="Вопросы и ответы" title="Частые вопросы" />
            <p>Не нашли ответ? Позвоните нам или напишите — мы всё объясним.</p>
            <a href={site.phoneHref} className="btn btn--ghost"><Phone aria-hidden="true" /> {site.phone}</a>
          </div>
          <Accordion items={faq.slice(0, 5)} />
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="banner">
            <img className="banner__bg" src={img(photos.volunteers, 1400, 500)} alt="" loading="lazy" />
            <div className="banner__content">
              <h2>Станьте волонтёром</h2>
              <p>Помогите пожилым и одиноким людям Севастополя. Найдём направление, которое подойдёт именно вам.</p>
              <Link to="/volunteers" className="btn btn--white">Хочу помогать <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
