@echo off
REM Script Windows (cmd) para ejecutar migración 011 y verificaciones contra una BD PostgreSQL
REM Requiere psql en PATH y que DATABASE_URL esté configurada como: postgres://USER:PASS@HOST:PORT/DBNAME
if "%DATABASE_URL%"=="" (
  echo Setear DATABASE_URL antes de ejecutar: set DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
  exit /b 1
)
echo Ejecutando migracion 011_reaplicar_consolidacion.sql en %DATABASE_URL%
psql "%DATABASE_URL%" -f supabase\migrations\011_reaplicar_consolidacion.sql
if errorlevel 1 (
  echo ERROR: la migracion devolvio un error
  exit /b 1
)

echo Ejecutando verificacion de funciones criticas (requiere que el usuario tenga permisos para consultar pg_proc)
psql "%DATABASE_URL%" -f supabase\tools\verificar_funciones_circulacion.sql

echo Ejecutando verificaciones public.verificar_circulacion() y public.verificar_rls()
psql "%DATABASE_URL%" -c "select * from public.verificar_circulacion();"
psql "%DATABASE_URL%" -c "select * from public.verificar_rls();"

echo Fin. Revisa la salida anterior para confirmar que todas las funciones son SECURITY DEFINER y tienen guardas internas.
