import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getSql } from "@/lib/db";

function validDate(value?: string) { return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null; }

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const sql = getSql();
  const todayRows = await sql`SELECT TO_CHAR(NOW() AT TIME ZONE 'America/Lima', 'YYYY-MM-DD') AS today`;
  const date = validDate(params.date) ?? String(todayRows[0].today);
  const rows = await sql`
    SELECT s.id, s.dni, s.institutional_code, s.first_names, s.last_names,
           a.entry_at, a.exit_at, a.status, a.match_distance
    FROM students s LEFT JOIN attendance a ON a.student_id=s.id AND a.attendance_date=${date}::date AND a.course_id IS NULL
    WHERE s.status='active' ORDER BY s.last_names, s.first_names
  `;
  const present = rows.filter((row) => row.entry_at).length;
  return (
    <>
      <PageHeader title="Reporte de asistencia" description="Entradas, salidas y ausencias calculadas para la fecha seleccionada." action={<a className="btn btn-secondary" href={`/api/reports/export?date=${date}`}><Download className="size-4" />Exportar CSV</a>} />
      <section className="card mb-5 p-5"><form className="flex flex-wrap items-end gap-3"><div><label className="label" htmlFor="date">Fecha</label><input className="input" id="date" name="date" type="date" defaultValue={date} /></div><button className="btn btn-primary">Consultar</button></form><div className="mt-4 flex flex-wrap gap-3 text-sm"><span className="badge badge-neutral">Alumnos: {rows.length}</span><span className="badge badge-success">Asistieron: {present}</span><span className="badge badge-danger">Faltas: {rows.length - present}</span></div></section>
      <section className="card table-wrap p-4"><table className="data-table"><thead><tr><th>Alumno</th><th>Código</th><th>Entrada</th><th>Salida</th><th>Estado</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-slate-500">No hay alumnos activos.</td></tr> : rows.map((row) => <tr key={String(row.id)}><td><span className="font-semibold">{String(row.last_names)}, {String(row.first_names)}</span><br /><span className="font-mono text-xs text-slate-500">DNI {String(row.dni)}</span></td><td className="font-mono">{String(row.institutional_code)}</td><td>{row.entry_at ? new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(String(row.entry_at))) : "—"}</td><td>{row.exit_at ? new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(String(row.exit_at))) : "—"}</td><td><span className={`badge ${row.entry_at ? "badge-success" : "badge-danger"}`}>{row.entry_at ? "Asistió" : "Falta"}</span></td></tr>)}</tbody></table></section>
    </>
  );
}
