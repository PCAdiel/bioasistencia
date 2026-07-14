# Asistencia Biométrica — Vercel + Supabase

Migración del prototipo académico original (PHP + MariaDB + Flask/DeepFace en XAMPP) a una aplicación web desplegable en Vercel con Next.js, Supabase PostgreSQL y reconocimiento facial ejecutado en el navegador.

> **Alcance:** proyecto académico/demostrativo. La prueba de vida implementada es básica y no equivale a un sistema biométrico certificado. Antes de usar datos reales se debe realizar una evaluación legal, de privacidad, seguridad y exactitud.

## Qué incluye

- Inicio de sesión con sesión segura en cookie `httpOnly`.
- Roles `admin` y `docente`.
- Alta, edición, activación e inactivación de alumnos.
- Consentimiento explícito antes del enrolamiento biométrico.
- Captura facial en el navegador con tres muestras y comprobación básica de parpadeo.
- Plantillas biométricas de 128 dimensiones cifradas con AES-256-GCM.
- Registro de entrada y salida, evitando duplicados por alumno, fecha y curso.
- Gestión de cursos.
- Reportes filtrables y exportación CSV.
- Bitácora de auditoría.
- Validación de entradas, comprobación de origen, límites básicos de solicitudes y cabeceras de seguridad.

## Arquitectura

~~~text
Navegador
  ├─ Cámara + face-api (la imagen no se guarda)
  └─ Interfaz Next.js
            │ HTTPS
            ▼
Vercel / Next.js Serverless Functions
  ├─ autenticación y autorización
  ├─ reglas de asistencia
  ├─ cifrado AES-GCM
  └─ auditoría
            │ TLS
            ▼
Supabase PostgreSQL
~~~

La aplicación ya no requiere XAMPP, Apache, PHP, MariaDB local ni un servicio Flask. Vercel aloja el frontend y las funciones; Supabase conserva los datos porque el sistema de archivos de Vercel no es una base de datos persistente.

Supabase se usa únicamente como PostgreSQL administrado. El navegador no utiliza la Data API, la clave `anon` ni `service_role`; todo acceso pasa por el backend autenticado de Next.js. Las tablas tienen RLS habilitado y no poseen políticas públicas.

## Requisitos

- Node.js 20 o superior.
- Un proyecto de Supabase y su cadena **Transaction pooler**, adecuada para funciones serverless.
- Navegador moderno con cámara y HTTPS. `localhost` también permite cámara durante el desarrollo.

## Configuración local

1. Instale dependencias:

   ~~~bash
   npm ci
   ~~~

2. Copie `.env.example` como `.env.local` y complete las variables.

3. Genere secretos independientes. Los siguientes comandos producen ejemplos válidos:

   ~~~bash
   openssl rand -base64 32
   openssl rand -base64 32
   ~~~

   Use el primer valor como `JWT_SECRET` y el segundo como `BIOMETRIC_ENCRYPTION_KEY`. No publique estos valores ni los reutilice.

4. Ejecute `database/migration.sql` en su base PostgreSQL.

5. Inicie la aplicación:

   ~~~bash
   npm run dev
   ~~~

6. Abra `http://localhost:3000/setup` y cree el primer administrador. La ruta queda bloqueada después de crearlo.

## Despliegue en Vercel

La guía completa está en [docs/DESPLIEGUE_VERCEL.md](docs/DESPLIEGUE_VERCEL.md). Resumen:

1. Suba esta carpeta a un repositorio privado de GitHub.
2. Cree un proyecto de Supabase y ejecute `database/migration.sql` desde SQL Editor.
3. Importe el repositorio desde Vercel.
4. Configure `DATABASE_URL`, `JWT_SECRET`, `BIOMETRIC_ENCRYPTION_KEY`, `FACE_MATCH_THRESHOLD` y `NEXT_PUBLIC_APP_NAME`.
5. Despliegue y visite `/setup` una sola vez.

No se incluye la base original ni datos personales/biométricos en este paquete. Se recomienda mantener el repositorio privado mientras el sistema gestione datos reales.

## Calidad y verificación

~~~bash
npm run check
~~~

El comando ejecuta lint, comprobación de TypeScript, pruebas unitarias y compilación de producción. Consulte [docs/PRUEBAS_Y_LIMITACIONES.md](docs/PRUEBAS_Y_LIMITACIONES.md) para el alcance y las pruebas manuales pendientes de realizar con cámara y base configurada.

## Estructura principal

~~~text
database/migration.sql         esquema PostgreSQL y protección RLS
database/verify_supabase.sql   comprobaciones de solo lectura
public/models/                 modelos locales para reconocimiento facial
src/app/                       páginas y API de Next.js
src/components/                formularios, navegación y captura facial
src/lib/                       autenticación, cifrado, BD y validaciones
docs/                          despliegue, seguridad y pruebas
~~~

## Seguridad y privacidad

- Las imágenes de cámara se procesan en memoria en el navegador y no se envían ni almacenan.
- La plantilla matemática sí se envía al servidor y se almacena cifrada; sigue siendo un dato biométrico sensible.
- El consentimiento debe ser informado, demostrable, revocable y adecuado a la finalidad.
- Al retirar el consentimiento, un administrador puede eliminar la plantilla biométrica desde la ficha del alumno.
- Cambiar `BIOMETRIC_ENCRYPTION_KEY` sin una migración controlada hace ilegibles las plantillas existentes.
- El umbral de coincidencia debe calibrarse con pruebas representativas y autorización institucional; `0.58` es solo un punto de partida técnico.

Más detalles en [docs/SEGURIDAD_Y_PRIVACIDAD.md](docs/SEGURIDAD_Y_PRIVACIDAD.md).
