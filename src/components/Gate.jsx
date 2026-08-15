import { LOGO } from '../lib/helpers.js';

export default function Gate({ draftName, draftArea, draftRole, setDraftName, setDraftArea, setDraftRole, onEnter, error, busy }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); onEnter(); }
  };

  return (
    <div className="gate">
      <div className="gate-card">
        <img className="logo gate-logo" src={LOGO} alt="Cidelsa" />
        <p className="eyebrow">planner del equipo</p>
        <h1>Anota lo tuyo, mira lo del equipo.</h1>
        <p className="sub">Escribe tu nombre y entras. Si ya estuviste aquí desde este mismo dispositivo, recuperas tus pendientes tal como los dejaste.</p>

        <div className="field">
          <label htmlFor="g-name">Tu nombre</label>
          <input
            id="g-name"
            className="input"
            placeholder="Ana Quispe"
            autoComplete="off"
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="field">
          <label htmlFor="g-area">Área o rol <span className="hint">(opcional)</span></label>
          <input
            id="g-area"
            className="input"
            placeholder="Comercial"
            autoComplete="off"
            value={draftArea}
            onChange={(e) => setDraftArea(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="field">
          <label>Cómo usarás la herramienta</label>
          <div className="roles">
            <button className="role" aria-pressed={draftRole === 'miembro'} onClick={() => setDraftRole('miembro')}>
              <b>Miembro</b><span>Solo mis pendientes</span>
            </button>
            <button className="role" aria-pressed={draftRole === 'lider'} onClick={() => setDraftRole('lider')}>
              <b>Líder</b><span>Además veo el tablero</span>
            </button>
          </div>
        </div>
        <button className="btn btn-full" onClick={onEnter} disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
        {error && <p className="gate-error">{error}</p>}
        <p className="gate-note">Sin contraseñas: alcanza con tu nombre. Tu sesión queda protegida en este dispositivo, así que solo tú puedes editar tus pendientes. Anota temas de trabajo, nada confidencial.</p>
      </div>
    </div>
  );
}
