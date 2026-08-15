import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from './supabaseClient.js';
import { COLORS } from './lib/helpers.js';
import Gate from './components/Gate.jsx';
import TopBar from './components/TopBar.jsx';
import Mine from './components/Mine.jsx';
import Board from './components/Board.jsx';
import Dashboard from './components/Dashboard.jsx';
import PersonPanel from './components/PersonPanel.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('gate');
  const [me, setMe] = useState(null);
  const [roster, setRoster] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [boardTasks, setBoardTasks] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [openPersonId, setOpenPersonId] = useState(null);
  const [toast, setToast] = useState(null);

  const [draftName, setDraftName] = useState('');
  const [draftArea, setDraftArea] = useState('');
  const [draftRole, setDraftRole] = useState('miembro');
  const [gateError, setGateError] = useState(null);
  const [gateBusy, setGateBusy] = useState(false);

  const toastTimer = useRef(null);
  const deleteTimers = useRef({});

  const showToast = useCallback((msg, actionLabel, action) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, actionLabel, action });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const ensureSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session.user;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
  }, []);

  const loadRoster = useCallback(async () => {
    const { data, error } = await supabase.from('equipo').select('*').order('created_at', { ascending: true });
    if (error) { showToast('No se pudo cargar el equipo. Revisa tu conexión.'); return []; }
    setRoster(data || []);
    return data || [];
  }, [showToast]);

  const loadMyTasks = useCallback(async (profileId) => {
    const { data, error } = await supabase.from('tareas').select('*').eq('perfil_id', profileId).order('created_at', { ascending: true });
    if (error) { showToast('No se pudieron cargar tus pendientes.'); return; }
    setMyTasks(data || []);
  }, [showToast]);

  const loadBoardTasks = useCallback(async () => {
    const { data, error } = await supabase.from('tareas').select('*').order('created_at', { ascending: true });
    if (error) { showToast('No se pudo actualizar el tablero.'); return; }
    const map = {};
    for (const t of (data || [])) {
      if (!map[t.perfil_id]) map[t.perfil_id] = [];
      map[t.perfil_id].push(t);
    }
    setBoardTasks(map);
  }, [showToast]);

  useEffect(() => {
    (async () => {
      try {
        const user = await ensureSession();
        const currentRoster = await loadRoster();
        const existing = currentRoster.find(p => p.auth_id === user.id);
        if (existing) {
          setMe(existing);
          await loadMyTasks(existing.id);
          setView('mine');
        } else {
          setView('gate');
        }
      } catch (e) {
        showToast('No se pudo conectar. Revisa tu conexión e intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    })();
  }, [ensureSession, loadRoster, loadMyTasks, showToast]);

  useEffect(() => {
    if ((view !== 'board' && view !== 'dashboard') || !me) return;
    loadBoardTasks();
    loadRoster();
    const id = setInterval(() => {
      if (!openPersonId) { loadBoardTasks(); loadRoster(); }
    }, 30000);
    return () => clearInterval(id);
  }, [view, me, loadBoardTasks, loadRoster, openPersonId]);

  const handleEnter = async () => {
    const name = draftName.trim();
    if (!name) { setGateError('Escribe tu nombre para entrar.'); return; }
    setGateBusy(true);
    setGateError(null);
    try {
      const user = await ensureSession();
      const currentRoster = await loadRoster();
      const existing = currentRoster.find(p => p.nombre.toLowerCase() === name.toLowerCase());
      if (existing) {
        if (existing.auth_id === user.id) {
          setMe(existing);
          await loadMyTasks(existing.id);
          setView('mine');
        } else {
          setGateError('Ese nombre ya existe, pero fue creado desde otro dispositivo o navegador. Como cada dispositivo tiene su propia sesión protegida, no podemos usarlo aquí. Entra desde el dispositivo original, o si eres otra persona, escribe un nombre distinto.');
        }
      } else {
        const color = COLORS[currentRoster.length % COLORS.length];
        const { data, error } = await supabase.from('equipo').insert({
          auth_id: user.id,
          nombre: name,
          area: draftArea.trim() || null,
          rol: draftRole,
          color,
        }).select().single();
        if (error) { setGateError('No se pudo crear tu perfil. Intenta de nuevo.'); }
        else {
          setRoster(prev => [...prev, data]);
          setMe(data);
          setMyTasks([]);
          setView('mine');
        }
      }
    } catch (e) {
      setGateError('No se pudo conectar. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setGateBusy(false);
    }
  };

  const handleExit = async () => {
    await supabase.auth.signOut();
    setMe(null);
    setMyTasks([]);
    setBoardTasks({});
    setOpenPersonId(null);
    setDraftName('');
    setDraftArea('');
    setDraftRole('miembro');
    setView('gate');
    try { await ensureSession(); } catch (e) { /* se reintenta al entrar */ }
  };

  const handleAdd = async (texto, fecha_limite) => {
    const { data, error } = await supabase.from('tareas').insert({
      perfil_id: me.id, texto, fecha_limite, hecha: false,
    }).select().single();
    if (error) { showToast('No se pudo guardar. Intenta de nuevo.'); return; }
    setMyTasks(prev => [...prev, data]);
  };

  const handleToggle = async (id) => {
    const task = myTasks.find(t => t.id === id);
    if (!task) return;
    const nowDone = !task.hecha;
    const now = new Date().toISOString();
    const completada_en = nowDone ? now : null;
    setMyTasks(prev => prev.map(t => t.id === id ? { ...t, hecha: nowDone, completada_en, updated_at: now } : t));
    const { error } = await supabase.from('tareas').update({ hecha: nowDone, completada_en, updated_at: now }).eq('id', id);
    if (error) {
      setMyTasks(prev => prev.map(t => t.id === id ? { ...t, hecha: !nowDone, completada_en: task.completada_en } : t));
      showToast('No se pudo guardar el cambio.');
      return;
    }
    if (nowDone) showToast('Completado.', 'Deshacer', () => handleToggle(id));
  };

  const handleDelete = (id) => {
    const task = myTasks.find(t => t.id === id);
    if (!task) return;
    setMyTasks(prev => prev.filter(t => t.id !== id));
    showToast('Pendiente eliminado.', 'Deshacer', () => {
      clearTimeout(deleteTimers.current[id]);
      delete deleteTimers.current[id];
      setMyTasks(prev => [...prev, task].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    });
    deleteTimers.current[id] = setTimeout(async () => {
      delete deleteTimers.current[id];
      const { error } = await supabase.from('tareas').delete().eq('id', id);
      if (error) {
        setMyTasks(prev => [...prev, task].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        showToast('No se pudo borrar. Vuelve a intentarlo.');
      }
    }, 5000);
  };

  const handleSaveEdit = async (id, value) => {
    setEditingId(null);
    const v = (value || '').trim();
    const task = myTasks.find(t => t.id === id);
    if (!task || !v || v === task.texto) return;
    setMyTasks(prev => prev.map(t => t.id === id ? { ...t, texto: v } : t));
    const { error } = await supabase.from('tareas').update({ texto: v, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      setMyTasks(prev => prev.map(t => t.id === id ? { ...t, texto: task.texto } : t));
      showToast('No se pudo guardar la edición.');
    }
  };

  if (loading) {
    return <div className="cd"><div className="loading">Cargando...</div></div>;
  }

  if (view === 'gate' || !me) {
    return (
      <div className="cd">
        <Gate
          draftName={draftName} draftArea={draftArea} draftRole={draftRole}
          setDraftName={setDraftName} setDraftArea={setDraftArea} setDraftRole={setDraftRole}
          onEnter={handleEnter} error={gateError} busy={gateBusy}
        />
        <Toast toast={toast} onAction={() => { toast?.action?.(); setToast(null); }} />
      </div>
    );
  }

  const openPerson = openPersonId ? roster.find(p => p.id === openPersonId) : null;

  return (
    <div className="cd">
      <TopBar me={me} view={view} setView={setView} onExit={handleExit} />
      <main className="wrap">
        {view === 'board' ? (
          <Board
            roster={roster}
            tasksByPerson={boardTasks}
            onOpenPerson={setOpenPersonId}
            onRefresh={() => { loadBoardTasks(); loadRoster(); showToast('Tablero actualizado.'); }}
          />
        ) : view === 'dashboard' ? (
          <Dashboard roster={roster} tasksByPerson={boardTasks} />
        ) : (
          <Mine
            me={me}
            tasks={myTasks}
            editingId={editingId}
            setEditingId={setEditingId}
            onAdd={handleAdd}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
          />
        )}
      </main>
      {openPerson && (
        <PersonPanel
          person={openPerson}
          tasks={boardTasks[openPerson.id] || []}
          onClose={() => setOpenPersonId(null)}
        />
      )}
      <Toast toast={toast} onAction={() => { toast?.action?.(); setToast(null); }} />
    </div>
  );
}
