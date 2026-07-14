-- Verificación de solo lectura después de ejecutar migration.sql en Supabase.

-- 1. Las siete tablas deben existir y mostrar rowsecurity = true.
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users',
    'students',
    'biometric_templates',
    'courses',
    'enrollments',
    'attendance',
    'audit_logs'
  )
ORDER BY tablename;

-- 2. Esta consulta no debe devolver permisos para anon/authenticated.
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'users',
    'students',
    'biometric_templates',
    'courses',
    'enrollments',
    'attendance',
    'audit_logs'
  )
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, table_name, privilege_type;

-- 3. Conteos iniciales esperados: usuarios 0 y cursos 1.
SELECT
  (SELECT COUNT(*) FROM users) AS users_count,
  (SELECT COUNT(*) FROM courses) AS courses_count;
