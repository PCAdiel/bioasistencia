
-- La API de Supabase requiere privilegios SQL además de RLS.
-- RLS conserva las restricciones por rol; estos GRANT no exponen plantillas biométricas.
grant usage on schema public to authenticated;
grant select on table public.profiles, public.students, public.courses, public.attendance, public.audit_logs to authenticated;
grant insert, update, delete on table public.profiles, public.students, public.courses, public.attendance to authenticated;
