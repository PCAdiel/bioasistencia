import { Plus, ShieldCheck, ShieldX } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getSql } from "@/lib/db";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const { created } = await searchParams;
  const students = await getSql()`
    SELECT s.id, s.dni, s.institutional_code, s.first_names, s.last_names, s.status,
           s.consent_at, s.created_at, (b.id IS NOT NULL) AS has_biometric
    FROM students s LEFT JOIN biometric_templates b ON b.student_id = s.id
    ORDER BY s.last_names, s.first_names
  `;
  return (
    <>
      <PageHeader title="Alumnos" description="Directorio institucional, estado de consentimiento y plantilla biométrica." action={<Link href="/alumnos/nuevo" className="btn btn-primary"><Plus className="size-4" />Registrar alumno</Link>} />
      {created === "1" && <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">Alumno y plantilla biométrica registrados correctamente.</p>}
      <section className="card table-wrap p-2 sm:p-4">
        <table className="data-table">
          <thead><tr><th>Alumno</th><th>DNI</th><th>Código</th><th>Biometría</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {students.length === 0 ? <tr><td colSpan={6} className="py-10 text-center text-slate-500">Aún no hay alumnos registrados.</td></tr> : students.map((student) => (
              <tr key={String(student.id)}>
                <td><span className="font-semibold text-slate-900">{String(student.last_names)}, {String(student.first_names)}</span></td>
                <td className="font-mono">{String(student.dni)}</td><td className="font-mono">{String(student.institutional_code)}</td>
                <td>{student.has_biometric ? <span className="badge badge-success"><ShieldCheck className="mr-1 size-3" />Protegida</span> : <span className="badge badge-danger"><ShieldX className="mr-1 size-3" />Sin plantilla</span>}</td>
                <td><span className={`badge ${student.status === "active" ? "badge-success" : "badge-neutral"}`}>{student.status === "active" ? "Activo" : "Inactivo"}</span></td>
                <td><Link className="font-semibold text-emerald-700 hover:text-emerald-900" href={`/alumnos/${student.id}`}>Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
