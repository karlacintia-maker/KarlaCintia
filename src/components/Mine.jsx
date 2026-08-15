import { useState } from 'react';
import Row from './Row.jsx';
import { CaretIcon } from './Icons.jsx';
import { stats, sortTasks } from '../lib/helpers.js';

export default function Mine({ me, tasks, editingId, setEditingId, onAdd, onToggle, onDelete, onSaveEdit }) {
  const [showDone, setShowDone] = useState(false);
  const [text, setText] = useState('');
  const [due, setDue] = useState('');

  const s = stats(tasks);
  const open = sortTasks(tasks.filter(t => !t.hecha));
  const done = tasks.filter(t => t.hecha).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  const hour = new Date().getHours();
  const saludo = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  const handleAdd = () => {
    const value = text.trim();
    if (!value) return;
    onAdd(value, due || null);
    setText('');
    setDue('');
  };

  return (
    <>
      <div className="head">
        <p className="eyebrow">mi espacio</p>
        <h2>{saludo}, {me.nombre.split(' ')[0]}</h2>
        <p>
          {s.total === 0 ? 'Empieza anotando lo primero que tengas en la cabeza.'
            : s.late > 0 ? `Tienes ${s.late} ${s.late === 1 ? 'pendiente vencido' : 'pendientes vencidos'}. Van primeros en la lista.`
            : s.open === 0 ? 'No te queda nada pendiente. Buen trabajo.'
            : `Te quedan ${s.open} ${s.open === 1 ? 'pendiente' : 'pendientes'}.`}
        </p>
      </div>

      {s.total > 0 && (
        <div className="progress">
          <div className="progress-top">
            <span className="progress-num">{s.done}</span>
            <span className="progress-lbl">de {s.total} completados</span>
            <span className="progress-pct">{s.pct}%</span>
          </div>
          <div className="bar"><i style={{ width: `${s.pct}%` }} /></div>
        </div>
      )}

      <div className="compose">
        <input
          className="input"
          placeholder="¿Qué tienes pendiente?"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
        />
        <input
          className="date"
          type="date"
          min="2020-01-01"
          title="Fecha límite opcional"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
        <button className="btn" onClick={handleAdd}>Agregar</button>
      </div>

      <p className="section-h">Pendientes <span className="count">{open.length}</span></p>
      <div className="list">
        {open.length ? open.map(t => (
          <Row
            key={t.id}
            task={t}
            isDone={false}
            editing={editingId === t.id}
            onToggle={onToggle}
            onDelete={onDelete}
            onStartEdit={setEditingId}
            onSaveEdit={(id, val) => { onSaveEdit(id, val); }}
            onCancelEdit={() => setEditingId(null)}
          />
        )) : (
          <div className="empty">
            <h3>{s.total ? 'Nada pendiente por ahora' : 'Tu lista está vacía'}</h3>
            <p>{s.total ? 'Cuando aparezca algo nuevo, escríbelo arriba y presiona Enter.'
              : 'Escribe arriba lo que tienes que hacer y presiona Enter. La fecha límite es opcional, ponla solo si te sirve.'}</p>
          </div>
        )}
      </div>

      {done.length > 0 && (
        <>
          <button className="toggle-done" onClick={() => setShowDone(v => !v)}>
            <CaretIcon open={showDone} />
            Completados <span className="count">{done.length}</span>
          </button>
          {showDone && (
            <div className="list">
              {done.map(t => (
                <Row
                  key={t.id}
                  task={t}
                  isDone={true}
                  editing={false}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onStartEdit={() => {}}
                  onSaveEdit={() => {}}
                  onCancelEdit={() => {}}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
