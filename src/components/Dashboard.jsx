import { useMemo } from 'react';
import { weekKey, weekLabel, formatDate, initials } from '../lib/helpers.js';

function flatten(roster, tasksByPerson) {
  const rosterById = Object.fromEntries(roster.map(p => [p.id, p]));
  const all = [];
  for (const personId of Object.keys(tasksByPerson)) {
    const person = rosterById[personId];
    if (!person) continue;
    for (const t of tasksByPerson[personId]) all.push({ ...t, person });
  }
  return all;
}

function KanbanCard({ task }) {
  const dateLabel = task.hecha
    ? `Completada el ${formatDate(task.completada_en || task.updated_at)}`
    : `Creada el ${formatDate(task.created_at)}`;
  return (
    <div className="kcard">
      <div className="kcard-top">
        <div className="avatar" style={{ background: task.person.color, width: 22, height: 22, fontSize: 10 }}>
          {initials(task.person.nombre)}
        </div>
        <span className="kcard-person">{task.person.nombre}</span>
      </div>
      <p className="kcard-text">{task.texto}</p>
      <span className="kcard-date">{dateLabel}</span>
    </div>
  );
}

export default function Dashboard({ roster, tasksByPerson }) {
  const allTasks = useMemo(() => flatten(roster, tasksByPerson), [roster, tasksByPerson]);

  const pending = useMemo(() => allTasks.filter(t => !t.hecha)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [allTasks]);
  const done = useMemo(() => allTasks.filter(t => t.hecha)
    .sort((a, b) => new Date(b.completada_en || b.updated_at) - new Date(a.completada_en || a.updated_at)), [allTasks]);

  const closedByPerson = useMemo(() => {
    const map = {};
    for (const t of done) {
      if (!map[t.person.id]) map[t.person.id] = { person: t.person, count: 0 };
      map[t.person.id].count++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [done]);
  const maxClosed = Math.max(1, ...closedByPerson.map(x => x.count));

  const pendingByWeek = useMemo(() => {
    const map = {};
    for (const t of pending) {
      const key = weekKey(t.created_at);
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [pending]);
  const maxPendingWeek = Math.max(1, ...pendingByWeek.map(([, c]) => c));

  const groupedByWeekPerson = useMemo(() => {
    const weeks = {};
    for (const t of allTasks) {
      const key = weekKey(t.created_at);
      if (!weeks[key]) weeks[key] = {};
      const pid = t.person.id;
      if (!weeks[key][pid]) weeks[key][pid] = { person: t.person, open: 0, done: 0 };
      if (t.hecha) weeks[key][pid].done++; else weeks[key][pid].open++;
    }
    return Object.entries(weeks)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, people]) => ({
        key,
        label: weekLabel(key),
        people: Object.values(people).sort((a, b) => a.person.nombre.localeCompare(b.person.nombre)),
      }));
  }, [allTasks]);

  if (!allTasks.length) {
    return (
      <div className="list"><div className="empty">
        <h3>Todavía no hay tareas del equipo</h3>
        <p>Cuando el equipo empiece a anotar pendientes, aquí vas a ver el resumen.</p>
      </div></div>
    );
  }

  return (
    <>
      <div className="head">
        <p className="eyebrow">resumen del equipo</p>
        <h2>Cómo va todo, de un vistazo</h2>
        <p>Tareas pendientes y completadas de todo el equipo, agrupadas por persona y por semana.</p>
      </div>

      <p className="section-h">Kanban</p>
      <div className="kanban">
        <div className="kcol">
          <div className="kcol-h">Pendientes <span className="count">{pending.length}</span></div>
          <div className="kcol-body">
            {pending.length ? pending.map(t => <KanbanCard key={t.id} task={t} />) : <p className="kempty">Nada pendiente.</p>}
          </div>
        </div>
        <div className="kcol">
          <div className="kcol-h">Completadas <span className="count">{done.length}</span></div>
          <div className="kcol-body">
            {done.length ? done.map(t => <KanbanCard key={t.id} task={t} />) : <p className="kempty">Nadie ha completado nada aún.</p>}
          </div>
        </div>
      </div>

      <p className="section-h">Completadas por persona</p>
      <div className="list barlist">
        {closedByPerson.map(({ person, count }) => (
          <div className="baritem" key={person.id}>
            <span className="baritem-label">{person.nombre}</span>
            <div className="bar"><i style={{ width: `${(count / maxClosed) * 100}%`, background: person.color }} /></div>
            <span className="baritem-val">{count}</span>
          </div>
        ))}
      </div>

      <p className="section-h">Pendientes por semana</p>
      <div className="list barlist">
        {pendingByWeek.map(([key, count]) => (
          <div className="baritem" key={key}>
            <span className="baritem-label">{weekLabel(key)}</span>
            <div className="bar"><i style={{ width: `${(count / maxPendingWeek) * 100}%` }} /></div>
            <span className="baritem-val">{count}</span>
          </div>
        ))}
      </div>

      <p className="section-h">Tareas por semana y por persona</p>
      {groupedByWeekPerson.map(week => (
        <div className="weekgroup" key={week.key}>
          <p className="weekgroup-h">{week.label}</p>
          <div className="list">
            {week.people.map(({ person, open, done: doneCount }) => (
              <div className="item" key={person.id}>
                <div className="avatar" style={{ background: person.color }}>{initials(person.nombre)}</div>
                <div className="item-body">
                  <span className="item-text">{person.nombre}</span>
                  <span className="item-meta">{open} pendiente{open === 1 ? '' : 's'} · {doneCount} completada{doneCount === 1 ? '' : 's'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
