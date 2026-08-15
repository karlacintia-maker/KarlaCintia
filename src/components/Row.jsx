import { CheckIcon } from './Icons.jsx';
import { dueChipInfo, formatDate } from '../lib/helpers.js';

export default function Row({ task, isDone, editing, onToggle, onDelete, onStartEdit, onSaveEdit, onCancelEdit }) {
  const chip = !isDone ? dueChipInfo(task.fecha_limite) : null;
  const meta = isDone
    ? `Completada el ${formatDate(task.completada_en || task.updated_at)}`
    : `Creada el ${formatDate(task.created_at)}`;

  return (
    <div className={`item ${isDone ? 'done' : ''}`}>
      <button
        className={`tick ${isDone ? 'on' : ''}`}
        onClick={() => onToggle(task.id)}
        aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como completado'}
      >
        <CheckIcon />
      </button>
      <div className="item-body">
        {editing ? (
          <input
            className="item-edit"
            autoFocus
            defaultValue={task.texto}
            onBlur={(e) => onSaveEdit(task.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); onSaveEdit(task.id, e.target.value); }
              if (e.key === 'Escape') { e.preventDefault(); onCancelEdit(); }
            }}
          />
        ) : (
          <button className="item-text" onClick={() => onStartEdit(task.id)}>{task.texto}</button>
        )}
        <span className="item-meta">{meta}</span>
      </div>
      {chip && <span className={chip.cls}>{chip.label}</span>}
      <button className="x" onClick={() => onDelete(task.id)} aria-label="Eliminar">&times;</button>
    </div>
  );
}
