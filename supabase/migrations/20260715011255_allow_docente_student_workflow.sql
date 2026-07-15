
-- Docentes activos pueden registrar y actualizar alumnos para el flujo académico.
drop policy if exists "admin manages students" on public.students;
create policy "staff manages students" on public.students
for all to authenticated
using (public.is_staff())
with check (public.is_staff());
