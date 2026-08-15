import { useState, useMemo } from 'react';
import { stats, quietDays, initials } from '../lib/helpers.js';

function CardOf({ person, tasks, onOpen }) {
  const s = stats(tasks);
  const lastUpdate = tasks.reduce((max, t) => {
    const u = new Date(t.updated_at).getTime();
    return u > max ? u : max;
  }, new Date(person.created_at).getTime());
  const q = quietDays(new Date(lastUpdate).toISOString());

  return (
    <button className="card" onClick={() => onOpen(person.id)}>
      <div className="card-top">
        <div className="avatar" style={{ background: person.color }}>{initials(person.nombre)}</div>
        <div>
          <div className="card-name">{person.nombre}</div>
          {person.area && <div className="card-area">{person.area}</div>}
        </div>
      </div>
      <div className="card-nums"><b>{s.open}</b><span>{s.open === 1 ? 'pendiente' : 'pendientes'} de {s.total}</span></div>
      <div className="bar"><i style={{ width: `${s.pct}%`, background: person.color }} /></div>
      <div className="card-flags">
        {s.late > 0 && <span className="chip late">{s.late} {s.late === 1 ? 'vencido' : 'vencidos'}</span>}
        {q >= 3 && s.open > 0 && <span className="chip warn">Sin movimiento {q} días</span>}
        {s.total > 0 && s.open === 0 && <span className="chip">Al día</span>}
        {s.total === 0 && <span className="chip">Aún no anota nada</span>}
      </div>
    </button>
  );
}

export default function Board({ roster, tasksByPerson, onOpenPerson, onRefresh }) {
  const [sortBy, setSortBy] = useState('pendientes');
  const [onlyLate, setOnlyLate] = useState(false);

  const totals = useMemo(() => {
    return roster.reduce((a, p) => {
      const s = stats(tasksByPerson[p.id] || []);
      a.open += s.open; a.done += s.done; a.late += s.late; a.total += s.total;
      return a;
    }, { open: 0, done: 0, late: 0, total: 0 });
  }, [roster, tasksByPerson]);
  const pct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;

  const people = useMemo(() => {
    let list = roster.slice();
    if (onlyLate) list = list.filter(p => stats(tasksByPerson[p.id] || []).late > 0);
    list.sort((a, b) => {
      const A = stats(tasksByPerson[a.id] || []), B = stats(tasksByPerson[b.id] || []);
      if (sortBy === 'pendientes') return B.open - A.open;
      if (sortBy === 'avance') return A.pct - B.pct;
      if (sortBy === 'vencidos') return B.late - A.late;
      return a.nombre.localeCompare(b.nombre);
    });
    return list;
  }, [roster, tasksByPerson, sortBy, onlyLate]);

  return (
    <>
      <div className="head">
        <p className="eyebrow">tablero del equipo</p>
        <h2>Cómo va el equipo</h2>
        <p>Toca una tarjeta para ver la lista completa de esa persona.</p>
      </div>

      <div className="metrics">
        <div className="metric"><div className="v">{roster.length}</div><div className="k">Personas</div></div>
        <div className="metric"><div className="v">{totals.open}</div><div className="k">Pendientes abiertos</div></div>
        <div className={`metric ${totals.late ? 'alert' : ''}`}><div className="v">{totals.late}</div><div className="k">Vencidos</div></div>
        <div className="metric"><div className="v">{pct}%</div><div className="k">Avance general</div></div>
      </div>

      <div className="toolbar">
        <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="pendientes">Más pendientes primero</option>
          <option value="vencidos">Más vencidos primero</option>
          <option value="avance">Menor avance primero</option>
          <option value="nombre">Por nombre</option>
        </select>
        <button className="filter" aria-pressed={onlyLate} onClick={() => setOnlyLate(v => !v)}>Solo con vencidos</button>
        <button className="btn-ghost" onClick={onRefresh}>Actualizar</button>
      </div>

      {people.length ? (
        <div className="cards">
          {people.map(p => (
            <CardOf key={p.id} person={p} tasks={tasksByPerson[p.id] || []} onOpen={onOpenPerson} />
          ))}
        </div>
      ) : (
        <div className="list"><div className="empty">
          <h3>{onlyLate ? 'Nadie tiene vencidos' : 'Todavía no hay nadie registrado'}</h3>
          <p>{onlyLate ? 'Quita el filtro para ver a todo el equipo.' : 'Comparte el enlace con tu equipo para que cada quien entre con su nombre.'}</p>
        </div></div>
      )}

      <div className="foot">
        <p>Los datos se comparten entre todos los que abran este enlace. Cada persona solo puede editar su propia lista.</p>
      </div>
    </>
  );
}
