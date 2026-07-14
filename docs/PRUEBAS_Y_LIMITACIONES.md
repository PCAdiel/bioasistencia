# Pruebas y limitaciones

## Verificación automatizada incluida

Ejecute:

~~~bash
npm run check
~~~

El comando valida:

- reglas de ESLint;
- tipos TypeScript;
- pruebas unitarias de distancia euclidiana, promedio de muestras y validación dimensional;
- compilación de producción de Next.js.

## Matriz de pruebas manuales

| Caso | Resultado esperado |
|---|---|
| Abrir sin variables de entorno | Mensaje controlado que indica configurar la base; no se muestran secretos. |
| Crear primer administrador | Solo funciona si la tabla de usuarios está vacía. |
| Acceso sin sesión | Redirección a `/login`. |
| Docente abre `/usuarios` | Acceso denegado/redirección. |
| Alumno sin consentimiento | No permite enrolamiento facial. |
| Cámara denegada | Mensaje explicativo y posibilidad de reintentar. |
| Cero o varios rostros | Captura rechazada. |
| Sin parpadeo | No completa la prueba de vida. |
| Tres muestras válidas | Guarda una plantilla promedio cifrada. |
| Primer reconocimiento del día | Registra entrada. |
| Segundo inmediato | Evita duplicado/salida prematura. |
| Reconocimiento posterior | Registra salida. |
| Retiro de consentimiento | Elimina la plantilla biométrica y deja el alumno sin enrolamiento. |
| Exportación por fechas | CSV respeta el filtro y abre correctamente en una hoja de cálculo. |

## Límites de la validación entregada

La compilación y las pruebas unitarias no necesitan datos reales. La prueba integral de cámara, coincidencia y escritura en PostgreSQL requiere que quien despliega configure Supabase, las claves y un navegador con cámara. No se adjuntan datos personales para evitar reproducir el contenido sensible del volcado original.

## Criterio de uso

La versión entregada es adecuada para una demostración académica controlada. No debe considerarse lista para producción institucional hasta completar calibración biométrica, evaluación legal, pruebas de accesibilidad, pruebas de carga y revisión de seguridad independiente.
