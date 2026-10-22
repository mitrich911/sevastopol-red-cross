import { Link } from 'react-router-dom';
import { Phone, ArrowRight, AlertTriangle } from 'lucide-react';
import { steps, faq } from '../data/content';
import { Accordion, PageHero, SectionHead, usePageMeta } from '../components/ui';
import { site } from '../config/site';

export default function Help() {
  usePageMeta('Как получить помощь', 'Порядок получения помощи: заявка, консультация, оценка нуждаемости, договор и начало обслуживания.');
  return (
    <>
      <PageHero title="Как получить помощь" lead="Порядок простой: оставьте заявку, а дальше мы подскажем и поможем на каждом этапе.">
        <div className="hero__actions">
          <Link to="/apply" className="btn btn--primary btn--lg">Оставить заявку <ArrowRight aria-hidden="true" /></Link>
          <a href={site.phoneHref} className="btn btn--ghost btn--lg"><Phone aria-hidden="true" /> {site.phone}</a>
        </div>
      </PageHero>

      <section className="section">
        <div className="container">
          <ol className="timeline">
            {steps.map((s, i) => (
              <li key={s.title} className="timeline__item">
                <span className="timeline__num" aria-hidden="true">{i + 1}</span>
                <div className="timeline__card">
                  <span className="icon-badge icon-badge--soft"><s.icon aria-hidden="true" /></span>
                  <div>
                    <h2><span className="sr-only">Шаг {i + 1}. </span>{s.title}</h2>
                    <p>{s.text}</p>
                    {i === 0 && <Link to="/apply" className="link-arrow">Заполнить заявку онлайн <ArrowRight aria-hidden="true" /></Link>}
                    {i === 4 && <Link to="/documents" className="link-arrow">Перечень документов <ArrowRight aria-hidden="true" /></Link>}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="alert">
            <AlertTriangle aria-hidden="true" />
            <p>
              Служба не оказывает экстренную медицинскую помощь. При угрозе жизни и здоровью звоните{' '}
              <a href="tel:112"><strong>112</strong></a> или <a href="tel:103"><strong>103</strong></a>.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container narrow">
          <SectionHead eyebrow="Вопросы и ответы" title="Частые вопросы" center />
          <Accordion items={faq} />
        </div>
      </section>
    </>
  );
}
