import { BookOpen } from "lucide-react";
import { CourseForm } from "@/components/course-form";
import { PageHeader } from "@/components/page-header";
import { getSql } from "@/lib/db";

export default async function CoursesPage() {
  const courses = await getSql()`SELECT c.id, c.code, c.name, c.active, c.created_at, COUNT(e.student_id)::int AS students FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id GROUP BY c.id ORDER BY c.name`;
  return <><PageHeader title="Cursos" description="Catálogo académico preparado para matrículas y reportes por asignatura." /><CourseForm /><section className="card table-wrap p-4"><table className="data-table"><thead><tr><th>Código</th><th>Curso</th><th>Matriculados</th><th>Estado</th></tr></thead><tbody>{courses.length === 0 ? <tr><td colSpan={4} className="py-10 text-center text-slate-500">No hay cursos.</td></tr> : courses.map((course) => <tr key={String(course.id)}><td className="font-mono font-semibold">{String(course.code)}</td><td><span className="inline-flex items-center gap-2 font-semibold"><BookOpen className="size-4 text-emerald-700" />{String(course.name)}</span></td><td>{Number(course.students)}</td><td><span className={`badge ${course.active ? "badge-success" : "badge-neutral"}`}>{course.active ? "Activo" : "Inactivo"}</span></td></tr>)}</tbody></table></section></>;
}
