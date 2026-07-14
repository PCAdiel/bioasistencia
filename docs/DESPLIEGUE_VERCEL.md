# Guía de despliegue: Vercel + Supabase

## 1. Crear el proyecto en Supabase

1. Cree un proyecto desde el panel de Supabase.
2. Elija una región cercana a quienes utilizarán la demostración.
3. Guarde la contraseña de base de datos en un gestor seguro.
4. Espere hasta que el proyecto figure como disponible.

Supabase Auth no se usa en esta versión. El login, las sesiones y los roles pertenecen a la aplicación Next.js, lo que permite cambiar únicamente la base sin alterar los flujos funcionales.

## 2. Crear el esquema

1. Abra **SQL Editor** en Supabase.
2. Cree una consulta nueva.
3. Copie y ejecute todo `database/migration.sql`.
4. Confirme en **Table Editor** que existan las tablas `users`, `students`, `biometric_templates`, `courses`, `enrollments`, `attendance` y `audit_logs`.

La migración habilita RLS y revoca el acceso de `anon` y `authenticated`. No cree políticas públicas: la aplicación accede por una conexión PostgreSQL privada desde las funciones de Vercel.

No importe `asistencia_biometrica.sql`. Ese archivo es MariaDB, contiene información del prototipo y no forma parte de esta entrega limpia.

## 3. Obtener la conexión correcta

1. Pulse **Connect** en el panel del proyecto.
2. Seleccione **Transaction pooler**.
3. Copie la URI de conexión que utiliza el puerto `6543`.
4. Reemplace el marcador de contraseña si el panel todavía lo muestra.
5. Verifique que la cadena termine con `sslmode=require`; agréguelo como parámetro si fuera necesario.

El Transaction pooler es el modo indicado por Supabase para funciones serverless. El proyecto desactiva consultas preparadas porque este modo no las soporta.

Ejemplo estructural — no lo copie como credencial real:

~~~text
postgresql://postgres.PROJECT_REF:CLAVE@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require
~~~

No use la conexión directa como `DATABASE_URL` de Vercel. La conexión directa se reserva para herramientas administrativas y migraciones cuando la red sea compatible.

## 4. Preparar GitHub

1. Cree un repositorio privado.
2. Suba el contenido del proyecto, no la carpeta contenedora si Vercel debe detectar el `package.json` en la raíz.
3. No suba `node_modules`, `.next`, archivos `.env`, volcados SQL con datos ni claves.
4. `.env.example` debe mantenerse como plantilla sin credenciales reales.

## 5. Importar en Vercel

1. En Vercel, seleccione **Add New → Project**.
2. Importe el repositorio de GitHub.
3. Confirme que Framework Preset sea **Next.js**.
4. Mantenga el comando de build `npm run build`.

## 6. Variables de entorno

Configure las variables en Production, y también en Preview si probará ramas:

| Variable | Obligatoria | Descripción |
|---|---:|---|
| `DATABASE_URL` | Sí | URI del Transaction pooler de Supabase con TLS. |
| `JWT_SECRET` | Sí | Secreto aleatorio independiente, mínimo 32 caracteres. |
| `BIOMETRIC_ENCRYPTION_KEY` | Sí | Exactamente 32 bytes codificados en Base64. |
| `FACE_MATCH_THRESHOLD` | No | Distancia máxima; punto inicial técnico `0.58`. |
| `NEXT_PUBLIC_APP_NAME` | No | Nombre mostrado por la interfaz. |

Genere valores independientes para los dos secretos:

~~~bash
openssl rand -base64 32
~~~

No configure `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` ni `NEXT_PUBLIC_SUPABASE_*`: este proyecto no las necesita. Nunca publique la contraseña de base de datos.

## 7. Primer inicio

1. Despliegue el proyecto.
2. Abra `https://su-dominio.vercel.app/setup`.
3. Cree el primer administrador con una contraseña de 10 o más caracteres.
4. Inicie sesión.
5. Cree un alumno ficticio, confirme el consentimiento y pruebe la cámara.

`/setup` queda inhabilitado después de crear el primer usuario.

## 8. Verificar la protección de Supabase

Desde SQL Editor ejecute `database/verify_supabase.sql`. El archivo confirma RLS, permisos públicos y conteos iniciales. Su comprobación principal es equivalente a:

~~~sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'users', 'students', 'biometric_templates', 'courses',
    'enrollments', 'attendance', 'audit_logs'
  )
order by tablename;
~~~

Todas las filas deben mostrar `rowsecurity = true`. En **Database → Advisors**, revise los avisos de seguridad después de cualquier cambio de esquema.

## 9. Pruebas posteriores

- Inicio y cierre de sesión.
- Un docente no accede a usuarios ni auditoría.
- Alta, edición e inactivación de alumno.
- Denegación de cámara y recuperación del error.
- Enrolamiento con un rostro, parpadeo y tres muestras.
- Entrada, duplicado inmediato y salida posterior.
- Filtros y exportación CSV.
- Retiro del consentimiento y eliminación de la plantilla.
- Ausencia de secretos o vectores en logs de Vercel.

## 10. Mantenimiento

- Mantenga `DATABASE_URL`, `JWT_SECRET` y `BIOMETRIC_ENCRYPTION_KEY` únicamente en Vercel.
- Antes de actualizar dependencias ejecute `npm run check`.
- Revise Security y Performance Advisors de Supabase tras cambios SQL.
- Defina copias, conservación y eliminación antes de utilizar datos reales.
- Cambiar la clave biométrica sin una migración controlada vuelve ilegibles las plantillas existentes.

Los planes gratuitos de Vercel y Supabase tienen límites y condiciones que pueden cambiar. Revise los valores vigentes antes de una demostración con alta concurrencia.
