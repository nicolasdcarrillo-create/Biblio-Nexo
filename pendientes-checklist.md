# Lista de pendientes — BiblioNexo

Checklist de trabajo, no documentación permanente del proyecto (esa vive en
`PROMPT-produccion.md` y `ESTADO.md`, dentro del repo). Pensada para ir
tachando a medida que se resuelve cada cosa.

Última actualización: 20 de agosto de 2026.

---

## 🔴 Urgente — falta este paso tuyo

- [ ] **Subir el commit de la corrección de seguridad.** Ya está lista y
      probada — falta el `git add`/`commit`/`push` de tu lado. Archivos:
      `supabase/migrations/010_consolidacion.sql`, `js/escaneo-remoto.js`,
      `pruebas/probar-escaneo-remoto.mjs`, `pruebas/probar-migraciones.py`,
      `pruebas/probar_librero.py`, `PROMPT-produccion.md`, `ESTADO.md`,
      `pruebas/LEEME.md`.

---

## 🟠 Ahora — barato y con impacto real

- [ ] Enganchar `probar-vistas.mjs` a `.github/workflows/pruebas.yml` (hoy
      solo corre a mano).
- [ ] Enganchar `probar-migraciones.py` a `.github/workflows/pruebas.yml`.
- [ ] Enganchar `probar-escaneo-remoto.mjs` a `.github/workflows/pruebas.yml`.
- [ ] Decidir qué hacer con la política RLS "de más" en la tabla `usuarios`.
- [ ] `migration repair` para las migraciones 012, 013 y 014 — requiere tu
      aprobación antes de tocar producción.
- [ ] Alinear la CI a `postgres:17` en los trabajos `base-de-datos` y
      `reconstruccion` (hoy corre contra `postgres:16`).

---

## 🟡 Después — más esfuerzo, sigue siendo importante

- [ ] **Fase 2: integración con Aleph 500** — el siguiente bloque de trabajo
      real, cuando decidas empezarlo (`PROMPT-produccion.md` §7).
- [ ] `verificar_politicas()` — RLS y grants bajo el mismo patrón que ya
      existe para funciones (`verificar_definiciones()`).
- [ ] Terminar de dividir `ui.js`/`ui-base.js` en archivos más chicos.
- [ ] Script de verificación estático de clases de Tailwind no compiladas
      (ítem 12, recomendado pero no construido — evita el build step).
- [ ] Corregir dos bugs preexistentes y silenciosos de clases Tailwind ya
      encontrados (cosméticos, no urgentes): `mx-auto` en los círculos
      numerados de `escaneo-remoto.js`, y `hover:bg-rose-100` en el botón de
      cerrar sesión de `perfil.js`.

---

## ⚫ No es código, pero bloquea el cierre del proyecto

- [ ] Asignar, por nombre, quién aprieta el botón de respaldo de Supabase.
- [ ] Designar Delegado de Protección de Datos y Encargado de
      Ciberseguridad, y firmar el encargo de tratamiento — **antes del 1 de
      diciembre de 2026** (Ley 21.719).
- [ ] Cifrado de disco y bloqueo de sesión en el equipo del mesón — urgente
      desde la Fase 1.2, sin resolver todavía. Ver `CUMPLIMIENTO-LEGAL.md` §9 bis.

---

## ✅ Ya verificado en esta ronda (referencia, no acción)

- [x] CI #33 en verde — Fases 1.2, 1.3 y 1.4 subidas y confirmadas.
- [x] CI #32 en verde — ítems 11, 12 y 13 ("pulido, no urgente").
- [x] Fase 1 completa (1.1 a 1.4): funcionamiento sin conexión.
- [x] Hueco de seguridad en `deshacer_libro_remoto()` corregido y probado
      (136 comprobaciones en `probar-migraciones.py`, dos escenarios de
      esquema) — falta subir el commit, ver 🔴 arriba.
- [ ] Confirmar en un celular real que el ícono nuevo (512×512) se ve bien —
      nadie lo verificó todavía fuera de la vista previa.
- [ ] Probar en producción, con un enlace real, escanear un libro nuevo y
      uno existente, y usar "Deshacer" en ambos — solo se probó simulado.
