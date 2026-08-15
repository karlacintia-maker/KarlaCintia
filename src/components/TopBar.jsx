import { LOGO, initials } from '../lib/helpers.js';

export default function TopBar({ me, view, setView, onExit }) {
  const isLeader = me.rol === 'lider';
  return (
    <header className="top">
      <div className="wrap top-in">
        <img className="logo" src={LOGO} alt="Cidelsa" />
        <nav className="tabs">
          <button className="tab" aria-selected={view === 'mine'} onClick={() => setView('mine')}>Mi espacio</button>
          {isLeader && (
            <>
              <button className="tab" aria-selected={view === 'board'} onClick={() => setView('board')}>Tablero del equipo</button>
              <button className="tab" aria-selected={view === 'dashboard'} onClick={() => setView('dashboard')}>Resumen</button>
            </>
          )}
        </nav>
        <div className="top-right">
          <div className="who">
            <div className="avatar" style={{ background: me.color }}>{initials(me.nombre)}</div>
            <span className="who-name">{me.nombre}</span>
          </div>
          <button className="link" onClick={onExit}>Salir</button>
        </div>
      </div>
    </header>
  );
}
