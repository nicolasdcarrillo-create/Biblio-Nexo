#!/usr/bin/env bash
# Script para Unix/macOS que ejecuta la migración 011 y comprobaciones.
# Uso:
#   export DATABASE_URL="postgres://USER:PASS@HOST:PORT/DB"
#   ./tools/run_migrations_and_checks.sh

if [ -z "$DATABASE_URL" ]; then
  echo "Setear DATABASE_URL antes de ejecutar, p.ej. export DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME"
  exit 1
fi

set -e

echo "Ejecutando migracion 011_reaplicar_consolidacion.sql en $DATABASE_URL"
psql "$DATABASE_URL" -f supabase/migrations/011_reaplicar_consolidacion.sql

echo "Ejecutando verificacion de funciones criticas"
psql "$DATABASE_URL" -f supabase/tools/verificar_funciones_circulacion.sql

echo "Verificando public.verificar_circulacion()"
psql "$DATABASE_URL" -c "select * from public.verificar_circulacion();"

echo "Verificando public.verificar_rls()"
psql "$DATABASE_URL" -c "select * from public.verificar_rls();"

echo "Ejecucion completa. Revise la salida para confirmar que las funciones son SECURITY DEFINER y que las guardas internas están presentes."
