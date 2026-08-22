# Plantilla del correo de invitación — "Invite user"

No es un archivo que Supabase lea automáticamente: esta plantilla se pega a
mano en el Dashboard (o vía la Management API), porque los templates de
correo de Auth no son parte del esquema ni del código de la app. Este
archivo queda en el repo para que la próxima persona sepa qué se puso y por
qué, y para no tener que reconstruirla si alguien la borra sin querer.

## Por qué existía un problema

El texto que trae Supabase por defecto para `inviteUserByEmail` (usado por
el Edge Function `invitar-personal`) viene con su propia marca: llega desde
`noreply@mail.app.supabase.io`, dice "You've been invited... powered by
Supabase" y trae un enlace "Opt out of these emails". Eso puede confundir a
quien lo recibe, dándole a entender que tiene algún tipo de acceso a
Supabase (el backend) y no solo a la aplicación BiblioNexo.

Además — esto es más importante que la marca — **mientras el proyecto use
el servidor SMTP compartido de Supabase (el que viene por defecto, sin
configurar nada), Auth solo entrega estos correos a direcciones que ya son
parte del "Team" de la organización en Supabase.** A cualquier otra
dirección le falla en silencio con `Email address not authorized`. Esto
está documentado en
[Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp):
el servidor por defecto es "best-effort", pensado solo para explorar y
probar plantillas con el propio equipo — no para producción. En la
práctica, esto significa que el formulario "Invitar personal nuevo" **no
va a funcionar todavía para una persona nueva de verdad**, salvo que
también esa persona sea miembro del equipo de la organización en el
Dashboard de Supabase (algo que no tiene sentido pedirle a cada persona que
se va a incorporar a la biblioteca).

La solución completa tiene dos partes independientes — la plantilla se
puede cambiar ya mismo, gratis; el SMTP propio requiere un dominio propio y
una cuenta en un proveedor de envío.

## Parte 1 — Cambiar la plantilla (ya se puede hacer)

Dashboard → tu proyecto → **Authentication** → **Email Templates** →
pestaña **Invite user**. Reemplazar los dos campos:

**Subject** (asunto):

```
Te invitaron a formar parte de BiblioNexo
```

**Message body** (cuerpo, HTML — reemplaza todo el contenido del campo):

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F4EB;padding:32px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:12px;overflow:hidden;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
        <tr>
          <td style="background-color:#1B3B48;padding:28px 32px;">
            <span style="font-family:Georgia,'Newsreader',serif;font-size:22px;color:#F7F4EB;letter-spacing:0.5px;">BiblioNexo</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-family:Georgia,'Newsreader',serif;font-size:20px;color:#2C4A3E;">Te invitaron a BiblioNexo</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333333;">
              Una persona administradora de BiblioNexo te invitó a crear tu cuenta de personal en la biblioteca.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#333333;">
              Este enlace es solo para BiblioNexo — no te da acceso a ningún otro sistema ni panel externo.
            </p>
            <p style="margin:0 0 28px;text-align:center;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#7A431D;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Aceptar invitación</a>
            </p>
            <p style="margin:0;font-size:13px;line-height:1.5;color:#7A7A7A;">
              Si no esperabas este correo, puedes ignorarlo con tranquilidad — no se creará ninguna cuenta sin que la acepten.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

Usa los colores reales de la identidad "Patrimonio de Futrono"
(`--patrimonio-base`, `--patrimonio-lago`, `--patrimonio-madera`, etc., de
`css/styles.css`) y las mismas familias tipográficas de la app (Newsreader
+ Plus Jakarta Sans, con reemplazo web-safe porque los clientes de correo
no cargan Google Fonts). No queda ninguna mención a Supabase.

`{{ .ConfirmationURL }}` es la variable que Supabase reemplaza por el
enlace real de aceptación — tiene que quedar exactamente así, con esa
sintaxis de Go Templates.

Esto arregla la apariencia. **No arregla** la restricción de "solo al
equipo" — para eso hace falta la parte 2.

## Parte 2 — SMTP propio (arregla el problema de fondo)

Requiere:

1. **Un dominio propio** (no puede ser un subdominio de `vercel.app`,
   porque hace falta agregar registros DNS y eso solo se puede en un
   dominio que uno controla). Si BiblioNexo no tiene uno todavía, es una
   compra aparte (~US$10–15/año) — se puede hacer, por ejemplo, desde
   Vercel mismo.
2. **Una cuenta en un proveedor de envío de correo transaccional** — el
   más simple de conectar con Supabase es
   [Resend](https://resend.com/docs/send-with-supabase-smtp) (nivel
   gratuito: ~3.000 correos al mes). Otras opciones válidas: AWS SES,
   Postmark, SendGrid, Brevo.
3. Verificar el dominio en el proveedor elegido (agrega un par de
   registros DNS tipo TXT/CNAME — lo indica el propio proveedor).
4. En el Dashboard de Supabase: **Project Settings → Auth → SMTP
   Settings** (o la página `/auth/smtp` del proyecto) → activar "Enable
   Custom SMTP" y completar:
   - Sender email: por ejemplo `no-reply@tudominio.cl`
   - Sender name: `BiblioNexo`
   - Host / Port / User / Password: los que entregue el proveedor (con
     Resend: host `smtp.resend.com`, usuario `resend`, contraseña = la
     API key de Resend)
5. Guardar. Desde ese momento, todos los correos de Auth (invitación,
   recuperación de contraseña, etc.) salen desde el dominio propio, sin
   el límite de "solo al equipo", y con la plantilla de la Parte 1
   (que ya no depende del servidor compartido).

Ninguno de los dos pasos necesita cambios de código ni una migración —
ambos se hacen desde el Dashboard de Supabase, con la cuenta de quien
administra el proyecto.
