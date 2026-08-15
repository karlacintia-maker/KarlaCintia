# Planner del equipo Cidelsa

Reglas y decisiones fijas de este proyecto. Léelas antes de proponer cambios grandes.

## Qué es esto
Herramienta para que el equipo de Cidelsa anote sus pendientes. Cada persona entra escribiendo su nombre (sin contraseña) y gestiona sus propias tareas. Quien tiene rol de líder ve además un tablero con el avance de todo el equipo.

## Decisiones tomadas con la dueña del proyecto
- **Costo: $0.** Todo corre en los planes gratuitos de Supabase, Vercel y GitHub. No agregar servicios de pago sin confirmar antes.
- **Login solo por nombre**, sin contraseña. Por debajo se usa el inicio de sesión anónimo de Supabase para poder aplicar reglas de acceso reales sin pedir contraseña a nadie. Esto significa que la identidad de cada persona queda ligada al navegador/dispositivo donde entró la primera vez. Si alguien entra desde un dispositivo nuevo con un nombre que ya existe, no puede "recuperar" ese perfil (por diseño, es la protección de datos); debe entrar desde el dispositivo original o usar un nombre distinto.
- **Base de datos:** Supabase (proyecto "karlacintia-maker's Project"), tablas `equipo` y `tareas`, con reglas de acceso (RLS) activas.
- **Reglas de acceso:** cualquier persona autenticada puede leer la tabla `equipo`. Cada quien crea/edita solo su propia fila en `equipo` y solo sus propias filas en `tareas`. Quien tenga `rol = 'lider'` puede además leer (no editar) las `tareas` de todo el equipo.
- **No existe una función de "borrar todos los datos"** en la interfaz. Se omitió a propósito: rompería el modelo de reglas de acceso (nadie tiene permiso de borrar datos ajenos) y es una acción muy destructiva para dejarla a un clic.
- La herramienta guarda nombres y tareas de personas del equipo (no solo de la dueña del proyecto), así que el ambiente de prueba y la revisión de seguridad (`/security-review`) son piezas obligatorias del arnés, no opcionales.

## Tecnología
- React + Vite para la pantalla.
- Supabase (`@supabase/supabase-js`) para base de datos y sesión anónima.
- Vercel para publicar.
- Variables de entorno en `.env` (no se sube a GitHub): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. En Vercel hay que configurarlas igual antes de publicar.
