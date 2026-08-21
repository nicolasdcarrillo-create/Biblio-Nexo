-- Verifica propiedades de funciones críticas de circulación en la base de datos
-- Devuelve: nombre de la función, si corre como SECURITY DEFINER, y si su definición contiene guardas internas (es_personal/es_admin)

select
  p.proname as funcion,
  p.prosecdef as es_definer,
  case when (pg_get_functiondef(p.oid) ilike '%es_personal(%' or pg_get_functiondef(p.oid) ilike '%es_admin(%') then true else false end as tiene_guarda,
  pg_get_functiondef(p.oid) as definicion
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'prestar_libro', 'devolver_prestamo', 'renovar_prestamo',
    'ajustar_copias', 'corregir_inventario', 'bloquear_lector',
    'actualizar_contacto_lector', 'actualizar_mi_perfil', 'mi_perfil',
    'estado_lector', 'consultar_libro', 'parametro_int',
    'registrar_auditoria', 'verificar_circulacion', 'verificar_rls', 'registrar_error'
  )
order by p.proname;
