@echo off
setlocal

REM ============================================================
REM Commit de la ronda "checklist de lanzamiento" (23-08-2026):
REM   - Politica de privacidad (privacidad.html, nueva)
REM   - Pagina 404 propia (404.html, nueva)
REM   - Open Graph tags en index.html
REM   - Enlace a privacidad.html en login y consentimiento (ui-base.js)
REM   - CSS scoped .pagina-legal en css/styles.css
REM   - Precache + cache-control para las 2 paginas nuevas (sw.js, vercel.json)
REM
REM Este script solo hace "git add" + "git commit". El "git push" lo
REM haces tu, a mano, despues de revisar que el commit quedo bien.
REM ============================================================

cd /d "%~dp0"

echo.
echo === Agregando archivos ===
git add index.html
git add 404.html
git add privacidad.html
git add css\styles.css
git add js\modules\ui-base.js
git add sw.js
git add vercel.json

echo.
echo === Creando commit ===
git commit ^
  -m "Checklist de lanzamiento: politica de privacidad, 404 propia y meta tags" ^
  -m "Politica de privacidad y terminos (privacidad.html, nueva):" ^
  -m "- Borrador redactado a partir de lo que el sistema hace hoy tecnicamente (mismo criterio que CUMPLIMIENTO-LEGAL.md)." ^
  -m "- Cubre: responsable del tratamiento, para que se usan los datos, tabla de que datos se recopilan, retencion de 5 anios (tomada del parametro real retencion_prestamos_anios), con quien se comparte, derechos ARCO+O, menores de edad, seguridad, y aclaracion de que no hay Google Analytics ni rastreadores de terceros (solo el registro de errores propio con redaccion de RUT/correo/telefono)." ^
  -m "- Quedan 3 campos marcados 'por definir' en la seccion de contacto (correo, telefono, direccion de atencion) pendientes de que el municipio los complete." ^
  -m "- Debe pasar por revision de la Direccion Juridica municipal antes de considerarse vigente; no es asesoria legal." ^
  -m "" ^
  -m "Pagina 404 propia (404.html, nueva):" ^
  -m "- Reemplaza la pagina generica de Vercel para rutas no encontradas, con el mismo estilo visual del sistema (glass-panel, tipografia Newsreader/Plus Jakarta Sans)." ^
  -m "" ^
  -m "index.html:" ^
  -m "- Se agregaron etiquetas Open Graph (og:type, og:site_name, og:locale, og:title, og:description, og:image) para una vista previa decente al compartir el enlace. Titulo y meta description ya existian y estaban correctos." ^
  -m "" ^
  -m "js/modules/ui-base.js:" ^
  -m "- Enlace a 'Politica de privacidad y terminos' en el pie del formulario de login." ^
  -m "- Enlace 'Ver la politica completa' agregado al texto de consentimiento que se muestra al inscribir un lector." ^
  -m "" ^
  -m "css/styles.css:" ^
  -m "- Nueva seccion .pagina-legal con todos los estilos de privacidad.html, deliberadamente prefijados (.pagina-legal h1, .pagina-legal a, etc.) para no redefinir elementos globales, ya que este archivo lo carga toda la app incluyendo index.html." ^
  -m "" ^
  -m "sw.js:" ^
  -m "- CACHE_VERSION subida de v12 a v13." ^
  -m "- privacidad.html y 404.html agregados a PRECACHE_URLS para que funcionen sin conexion." ^
  -m "" ^
  -m "vercel.json:" ^
  -m "- Cache-Control no-cache para /privacidad.html y /404.html, igual que las demas paginas HTML del sitio."

echo.
echo === Resumen del commit ===
git diff --cached --stat
git log -1 --stat

echo.
echo ============================================================
echo Listo. Revisa que todo se vea bien arriba y despues corre:
echo.
echo     git push
echo.
echo ============================================================
pause
