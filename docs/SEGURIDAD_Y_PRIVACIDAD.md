# Seguridad y privacidad

## Controles implementados

| Área | Implementación |
|---|---|
| Autenticación | Contraseñas con `bcrypt`; sesión JWT firmada en cookie `httpOnly`, `secure` y `sameSite=strict`. |
| Autorización | Roles `admin` y `docente`, verificados en servidor. |
| Biometría | Descriptor de 128 dimensiones cifrado con AES-256-GCM y clave fuera de la base. |
| Captura | Procesamiento local; no se persisten fotografías ni fotogramas. |
| Consentimiento | Obligatorio para enrolar y revocable mediante eliminación de plantilla. |
| Entradas | Esquemas Zod, parámetros SQL, comprobación de origen y límites básicos por IP. |
| Supabase | RLS en todas las tablas y permisos de `anon`/`authenticated` revocados; sin claves de API en el cliente. |
| Navegador | CSP, protección contra `iframe`, restricciones de cámara y cabeceras anti-sniffing. |
| Trazabilidad | Bitácora para accesos y operaciones críticas, sin guardar plantillas en metadatos. |
| Datos de entrega | El volcado original y sus datos reales no se incluyen en el proyecto migrado. |

## Riesgos residuales

- La prueba de vida por parpadeo reduce intentos simples, pero no resiste ataques sofisticados ni reemplaza un producto certificado.
- El descriptor se calcula en el navegador; un cliente manipulado podría enviar un vector fabricado. Para alta seguridad se requiere captura confiable, atestación o un servicio biométrico especializado.
- La comparación actual descifra hasta 2 000 plantillas y calcula distancias en el servidor. Es apropiada para una demostración pequeña, no para una institución grande.
- El limitador de solicitudes usa memoria de la función y es aproximado en una plataforma distribuida. Para producción se recomienda un almacén compartido como Redis/Upstash.
- La política CSP necesita `unsafe-eval` por el motor TensorFlow.js utilizado por la biblioteca facial. Conviene reevaluarlo si se sustituye el motor.
- No se ha realizado una prueba de penetración independiente ni una evaluación formal de impacto de privacidad.

## Recomendaciones antes de datos reales

1. Validar base legal, consentimiento, finalidad, conservación, revocación y atención de derechos con el responsable institucional.
2. Aprobar una política de conservación y borrado; la aplicación no debe conservar plantillas indefinidamente.
3. Calibrar el umbral midiendo falsos positivos y falsos negativos en condiciones representativas y con datos autorizados.
4. Realizar pruebas de seguridad externas, monitoreo, copias de seguridad y un procedimiento de respuesta a incidentes.
5. Sustituir la prueba de vida básica por tecnología evaluada si la asistencia tiene consecuencias académicas o administrativas importantes.
6. Informar una alternativa no biométrica para personas que no consientan o no puedan usar reconocimiento facial.

Este documento describe controles técnicos; no constituye una certificación de cumplimiento legal.
