
-- service_role usa estas tablas sólo dentro de Edge Functions; el navegador
-- continúa sin ningún permiso sobre las plantillas biométricas.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.biometric_templates to service_role;
grant insert on table public.audit_logs to service_role;
