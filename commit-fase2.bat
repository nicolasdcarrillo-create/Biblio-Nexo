@echo off
setlocal
cd /d "%~dp0"

echo === BiblioNexo - Fase 2: preparando commit ===
echo Carpeta: %cd%
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo ERROR: esta carpeta no es un repositorio git ^(no se encontro .git^).
  pause
  exit /b 1
)

echo Agregando los 13 archivos de la Fase 2...
git add "supabase/migrations/010_consolidacion.sql" "pruebas/verificar_consolidacion.py" "pruebas/probar_librero.py" "pruebas/probar-migraciones.py" "js/modules/utilidades.js" "escaneo-remoto.html" "js/escaneo-remoto.js" "js/vistas/mostrador.js" "js/modules/ui-base.js" "sw.js" "pruebas/probar-escaneo-remoto.mjs" "pruebas/probar-vistas.mjs" "pruebas/probar-interfaz.mjs"
if errorlevel 1 (
  echo ERROR: git add fallo. Revisa el mensaje de arriba.
  pause
  exit /b 1
)

echo.
echo Archivos que quedaron preparados para el commit:
git diff --cached --stat
echo.

git commit -m "Fase 2: escaneo remoto sin repetir stock, ficha de circulacion en vivo" -m "- Se saca la camara del meson: todo el escaneo se hace desde el celular via 'Escanear desde el celular' (QR)." -m "- agregar_libro_remoto() ya no suma ejemplares en silencio cuando el ISBN ya existe: ahora consultar_libro_remoto() (nueva RPC) devuelve quien lo tiene (prestamo o reserva, con RUT) para mostrarlo tanto en la pagina remota como en el meson." -m "- El meson se actualiza en vivo por Supabase Realtime (canal derivado del token del enlace) cada vez que se escanea algo desde el celular, sin ninguna accion manual." -m "- sw.js sube a v12 para invalidar cache de los archivos tocados." -m "- Ajustes de pruebas en los suites afectados; todo verde (probar-migraciones, probar_librero, probar-vistas, probar-interfaz, probar-escaneo-remoto, verificar_consolidacion, verificar_llamadas_rpc, verificar_clases_tailwind)."

if errorlevel 1 (
  echo.
  echo ERROR: git commit fallo. Revisa el mensaje de arriba ^(por ejemplo, si no hay nada nuevo que commitear^).
  pause
  exit /b 1
)

echo.
echo === Listo. El commit quedo hecho en tu rama actual. ===
git log -1 --stat
echo.
echo Ahora solo falta que corras:   git push
echo.
pause
