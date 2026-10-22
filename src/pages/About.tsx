import { Link } from 'react-router-dom';
import { Heart, Scale, Shield, Handshake, Globe, Users, CircleDot, GraduationCap, ClipboardCheck, MessageSquareHeart, UserCheck } from 'lucide-react';
import { img, photos } from '../data/content';
import { PageHero, SectionHead, usePageMeta } from '../components/ui';

const principles = [
  { icon: Heart, title: 'Гуманность', text: 'Стремимся облегчить страдания человека, защитить его жизнь, здоровье и достоинство.' },
  { icon: Scale, title: 'Беспристрастность', text: 'Помогаем всем, кто нуждается, независимо от национальности, веры и взглядов.' },
  { icon: Shield, title: 'Нейтральность', text: 'Не принимаем участия в политических, религиозных и идеологических спорах.' },
  { icon: CircleDot, title: 'Независимость', text: 'Действуем в интересах людей, сохраняя самостоятельность в принятии решений.' },
  { icon: Handshake, title: 'Добровольность', text: 'Помощь оказывается бескорыстно, без стремления к выгоде.' },
  { icon: Users, title: 'Единство', text: 'Открыты для всех и работаем на благо жителей всего города.' },
  { icon: Globe, title: 'Универсальность', text: 'Являемся частью всемирного движения Красного Креста и Красного Полумесяца.' },
];

const quality = [
  { icon: UserCheck, title: 'Отбор сотрудников', text: 'Собеседование, проверка документов и рекомендаций, стажировка под руководством наставника.' },
  { icon: GraduationCap, title: 'Обучение', text: 'Программы по уходу за тяжелобольными, первой помощи, психологии общения с пожилыми людьми.' },
  { icon: ClipboardCheck, title: 'Контроль качества', text: 'Куратор проводит плановые и внеплановые визиты, ведётся журнал обслуживания.' },
  { icon: MessageSquareHeart, title: 'Обратная связь', text: 'Регулярно узнаём мнение подопечных и родственников, оперативно решаем любые вопросы.' },
];

export default function About() {
  usePageMeta('О нас', 'Патронажная служба и служба милосердия Севастопольского Красного Креста: принципы работы, подготовка сотрудников, контроль качества.');
  return (
    <>
      <PageHero title="О нас" lead="Помогаем людям сохранять достоинство, самостоятельность и качество жизни — дома, рядом с близкими." photo={photos.team} />

      <section className="section">
        <div className="container split split--center">
          <div>
            <SectionHead eyebrow="Кто мы" title="Патронажная служба и служба милосердия" />
            <p className="text-lg">
              Мы — часть Российского Красного Креста, старейшей гуманитарной организации страны. В Севастополе
              мы помогаем пожилым, тяжелобольным, людям с инвалидностью и их семьям.
            </p>
            <p>
              Патронажные сёстры и социальные работники приходят на дом, а сёстры милосердия и добровольцы
              поддерживают тех, кто оказался в трудной жизненной ситуации. Мы работаем в тесном контакте с
              медицинскими и социальными учреждениями города.
            </p>
          </div>
          <img className="rounded-img" src={img(photos.elderly, 800, 600)} srcSet={`${img(photos.elderly, 480, 360)} 480w, ${img(photos.elderly, 800, 600)} 800w`} sizes="(max-width: 900px) 100vw, 50vw" alt="Пожилой мужчина с улыбкой" loading="lazy" />
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">
          <SectionHead eyebrow="Ценности" title="Принципы работы" lead="Основополагающие принципы Международного движения Красного Креста и Красного Полумесяца." center />
          <div className="grid grid--4 principles">
            {principles.map((p) => (
              <div key={p.title} className="principle">
                <p.icon aria-hidden="true" />
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Качество" title="Подготовка сотрудников и контроль качества" center />
          <div className="grid grid--2">
            {quality.map((q) => (
              <div key={q.title} className="feature feature--card">
                <span className="icon-badge"><q.icon aria-hidden="true" /></span>
                <div>
                  <h3>{q.title}</h3>
                  <p>{q.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="center-actions">
            <Link to="/apply" className="btn btn--primary btn--lg">Оставить заявку</Link>
            <Link to="/contacts" className="btn btn--ghost btn--lg">Связаться с нами</Link>
          </div>
        </div>
      </section>
    </>
  );
}
