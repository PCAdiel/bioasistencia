
-- Operaciones internas de reconocimiento: no se conceden al navegador.
grant select on table public.students to service_role;
grant select, insert, update on table public.attendance to service_role;
