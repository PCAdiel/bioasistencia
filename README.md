# Asistencia Biométrica — Angular + Supabase

Aplicación académica de asistencia: los usuarios ingresan con correo/contraseña y la biometría identifica únicamente a alumnos. Las imágenes se procesan en el navegador y nunca se almacenan; la plantilla facial se cifra y se compara sólo en Edge Functions.

## Requisitos e instalación

Instale Node.js 22+, Angular CLI y la [CLI de Supabase](https://supabase.com/docs/guides/cli). Ejecute `npm install`, copie `.env.example` a su configuración de despliegue y complete `public/app-config.js` con la URL y clave **anon** de su proyecto. No coloque claves de servicio allí.

```bash
npm start
supabase link --project-ref SU_REF
supabase db push
supabase secrets set BIOMETRIC_ENCRYPTION_KEY="BASE64_DE_32_BYTES" FACE_MATCH_THRESHOLD=0.58
supabase functions deploy setup-admin
supabase functions deploy enroll-biometric
supabase functions deploy recognize-attendance
```

En producción configure las mismas variables públicas mediante el mecanismo de su hosting, generando `app-config.js` antes de publicar. La anon key es pública por diseño; RLS la limita.

## Primer uso

1. Abra `/setup` y cree el primer administrador (contraseña de 10+ caracteres). La función bloquea solicitudes posteriores.
2. Inicie sesión en `/login`.
3. Cree un alumno en **Alumnos**, active la cámara, parpadee y capture 1–3 muestras. El descriptor promedio se cifra en la función.
4. En **Asistencia**, active cámara, parpadee y capture. La primera marcación es entrada; la segunda, tras 5 minutos, es salida.

## Seguridad y privacidad

Las migraciones están en `supabase/migrations/`; incluyen índices, restricciones y RLS. `biometric_templates` no tiene políticas de lectura/escritura para el navegador. Configure `BIOMETRIC_ENCRYPTION_KEY` y `SUPABASE_SERVICE_ROLE_KEY` exclusivamente como secretos de Edge Functions (el segundo ya existe en Supabase). Calibre el umbral con consentimiento institucional: 0.58 es sólo inicial. Esta prueba de vida por parpadeo es demostrativa, no certificada.

## Problemas comunes

- **Cámara bloqueada:** use HTTPS o `localhost`, permita cámara y asegure una sola cara iluminada.
- **No configurado:** revise que `public/app-config.js` contenga URL y anon key válidas.
- **Rostro no reconocido:** vuelva a enrolar con buena iluminación o ajuste el secreto `FACE_MATCH_THRESHOLD` con pruebas autorizadas.
- **Error de función:** confirme que aplicó migraciones, desplegó las tres funciones y configuró el secreto de cifrado.

## Despliegue en Vercel

1. Suba el repositorio a GitHub. `app-config.js` puede contener la URL y clave pública de Supabase, pero nunca claves de servicio ni cifrado.
2. Importe el repositorio en Vercel. La configuración `vercel.json` ya indica el directorio de salida y permite abrir directamente rutas como `/asistencia`.
3. En **Settings → Environment Variables** agregue estas variables para Production, Preview y Development:

```text
NG_APP_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
NG_APP_SUPABASE_ANON_KEY=TU_PUBLISHABLE_O_ANON_KEY
NG_APP_FACE_MATCH_THRESHOLD=0.58
```

4. Despliegue. Si no configura variables, Vercel usará el `app-config.js` público versionado; las variables de Vercel, si existen, tienen prioridad.

Validación: `npm run build` y `npx ng lint`.
