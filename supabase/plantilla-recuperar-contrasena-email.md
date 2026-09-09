# Plantilla de correo — Recuperar contraseña (Reset Password)

Mismo criterio que `plantilla-invitacion-email.md`: esto no es parte del
código de la app — Supabase Auth no lee ningún archivo del repo para armar
sus correos, así que esta plantilla se pega a mano en el Dashboard. Este
archivo queda en el repo solo para que quien la vuelva a tocar sepa qué hay
pegado ahí y por qué, sin tener que ir a buscarlo al Dashboard primero.

**Motivo:** el correo de recuperación de contraseña que envía Supabase por
defecto es la plantilla genérica en inglés, sin marca ("Reset your
password" / "Follow this link to reset the password for your user..."). El
23 de agosto de 2026 se reemplazó por esta versión, con el mismo estilo
visual que ya tenía la plantilla de invitación (colores, tipografía y
estructura de tabla del sistema).

## Dónde pegarla

Dashboard del proyecto → **Authentication → Email Templates → pestaña
"Reset Password"**. Hay dos campos: *Subject heading* y *Message body*.

## Variable que usa el enlace

Igual que en "Invite user": `{{ .ConfirmationURL }}`. Confirmado contra la
documentación oficial de Supabase (la plantilla por defecto de "Reset
Password" también usa `{{ .ConfirmationURL }}`) — **no cambiar ese nombre**,
es lo que Supabase reemplaza por el enlace real de recuperación; si se
escribe distinto, el botón queda apuntando a ningún lado y nadie puede
recuperar su contraseña.

## Subject

```
Recupera tu contraseña en BiblioNexo
```

## Message body (HTML)

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
            <h1 style="margin:0 0 16px;font-family:Georgia,'Newsreader',serif;font-size:20px;color:#2C4A3E;">Recupera tu contraseña</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333333;">Recibimos una solicitud para restablecer la contraseña de tu cuenta de personal en BiblioNexo.</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#333333;">Haz clic en el botón de abajo para elegir una nueva contraseña. Por tu seguridad, este enlace expira pronto y solo puede usarse una vez.</p>
            <p style="margin:0 0 28px;text-align:center;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#7A431D;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Restablecer contraseña</a></p>
            <p style="margin:0;font-size:13px;line-height:1.5;color:#7A7A7A;">Si no pediste este cambio, puedes ignorar este correo con tranquilidad — tu contraseña actual sigue funcionando y no se hará ningún cambio sin que uses este enlace.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

## Nota — mismo límite de envío que la invitación (Parte 2)

Este correo sale por el mismo servidor SMTP compartido de Supabase que la
invitación, así que tiene la misma limitación documentada en
`plantilla-invitacion-email.md`: **el SMTP compartido solo entrega a
direcciones que sean miembro de la organización de Supabase** ("Team").
Para que un lector o funcionario cualquiera pueda de verdad recibir el
correo de recuperación (no solo cuentas del equipo de Supabase), sigue
pendiente configurar un SMTP propio (dominio propio + un proveedor como
Resend) — ver esa sección para el detalle, no se repite acá porque es
exactamente el mismo pendiente para ambos correos.
