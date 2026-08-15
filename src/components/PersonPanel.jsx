import { CheckIcon } from './Icons.jsx';
import { stats, sortTasks, dueChipInfo, initials } from '../lib/helpers.js';

function Line({ t }) {
  const chip = !t.hecha ? dueChipInfo(t.fecha_limite) : null;
  return (
    <div className={`item ${t.hecha ? 'done' : ''}`}>
      <div className={`tick ${t.hecha ? 'on' : ''}`}><CheckIcon /></div>
      <div className="item-text">{t.texto}</div>
      {chip && <span className={chip.cls}>{chip.label}</span>}
    </div>
  );
}

export default function PersonPanel({ person, tasks, onClose }) {
  if (!person) return null;
  const s = stats(tasks);
  const open = sortTasks(tasks.filter(t => !t.hecha));
  const done = tasks.filter(t => t.hecha);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-top">
          <div className="avatar" style={{ background: person.color }}>{initials(person.nombre)}</div>
          <div>
            <div className="card-name">{person.nombre}</div>
            {person.area && <div className="card-area">{person.area}</div>}
          </div>
          <button className="x" onClick={onClose} aria-label="Cerrar">&times;</button>
        </div>
        <div className="progress" style={{ padding: '16px 18px', marginBottom: 22 }}>
          <div className="progress-top" style={{ marginBottom: 11 }}>
            <span className="progress-num" style={{ fontSize: 26 }}>{s.done}</span>
            <span className="progress-lbl">de {s.total} completados</span>
            <span className="progress-pct">{s.pct}%</span>
          </div>
          <div className="bar"><i style={{ width: `${s.pct}%`, background: person.color }} /></div>
        </div>
        <p className="section-h">Pendientes <span className="count">{open.length}</span></p>
        <div className="list">
          {open.length ? open.map(t => <Line key={t.id} t={t} />) : (
            <div className="empty"><p>Sin pendientes abiertos.</p></div>
          )}
        </div>
        {done.length > 0 && (
          <>
            <p className="section-h">Completados <span className="count">{done.length}</span></p>
            <div className="list">{done.map(t => <Line key={t.id} t={t} />)}</div>
          </>
        )}
      </div>
    </div>
  );
}
