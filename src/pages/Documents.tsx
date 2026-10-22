import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Printer, Info } from 'lucide-react';
import { documents } from '../data/content';
import { PageHero, usePageMeta } from '../components/ui';

export default function Documents() {
  usePageMeta('Документы', 'Перечень документов для оформления патронажного обслуживания и социальной помощи.');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const done = documents.filter((d) => checked[d.title]).length;

  return (
    <>
      <PageHero title="Документы" lead="Какие документы могут понадобиться для оформления обслуживания. Отмечайте собранные — так удобнее готовиться." />
      <section className="section">
        <div className="container docs">
          <div>
            <div className="docs__head">
              <p className="docs__progress" aria-live="polite">Собрано: <strong>{done} из {documents.length}</strong></p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => window.print()}>
                <Printer aria-hidden="true" /> Распечатать список
              </button>
            </div>
            <div className="progress" aria-hidden="true"><span style={{ width: `${(done / documents.length) * 100}%` }} /></div>
            <ul className="doc-list">
              {documents.map((d) => (
                <li key={d.title} className={checked[d.title] ? 'is-done' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!checked[d.title]}
                      onChange={(e) => setChecked({ ...checked, [d.title]: e.target.checked })}
                    />
                    <span className="doc-list__icon"><FileText aria-hidden="true" /></span>
                    <span>
                      <strong>{d.title}</strong>
                      {d.optional && <em className="tag">при наличии</em>}
                      <small>{d.note}</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <aside className="docs__aside">
            <div className="info-card">
              <Info aria-hidden="true" />
              <h2>Важно знать</h2>
              <p>
                Перечень предварительный. Окончательный список документов определяется индивидуально —
                в зависимости от вида помощи и жизненной ситуации.
              </p>
              <p>
                Требования законодательства и региональные правила могут меняться. Специалист уточнит
                актуальный перечень на консультации.
              </p>
              <p>Прикладывать документы к онлайн-заявке не обязательно. Оригиналы понадобятся при личном заключении договора.</p>
              <Link to="/apply" className="btn btn--primary btn--block">Оставить заявку</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
