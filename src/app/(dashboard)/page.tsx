import { BookOpen, CalendarCheck, ClipboardCheck, GraduationCap, ScanFace, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getSql } from "@/lib/db";

export default async function DashboardPage() {
  const sql = getSql();
  const metrics = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM students WHERE status = 'active') AS students,
      (SELECT COUNT(*)::int FROM attendance WHERE attendance_date = (NOW() AT TIME ZONE 'America/Lima')::date) AS present_today,
      (SELECT COUNT(*)::int FROM courses WHERE active = TRUE) AS courses,
      (SELECT COUNT(*)::int FROM biometric_templates) AS biometrics
  `;
  const data = metrics[0] ?? {};
  const stats = [
    { label: "Alumnos activos", value: Number(data.students ?? 0), icon: GraduationCap },
    { label: "Asistencias hoy", value: Number(data.present_today ?? 0), icon: CalendarCheck },
    { label: "Plantillas protegidas", value: Number(data.biometrics ?? 0), icon: ShieldCheck },
    { label: "Cursos activos", value: Number(data.courses ?? 0), icon: BookOpen },
  ];
  const shortcuts = [
    { href: "/alumnos/nuevo", title: "Registrar alumno", text: "Datos, consentimiento y tres muestras faciales.", icon: GraduationCap },
    { href: "/asistencia", title: "Marcar asistencia", text: "Verificar rostro y registrar entrada o salida.", icon: ScanFace },
    { href: "/reportes", title: "Consultar reportes", text: "Filtrar por fecha y exportar resultados.", icon: ClipboardCheck },
  ];

  return (
    <>
      <PageHeader title="Panel principal" description="Resumen operativo del sistema de asistencia biométrica." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <div className="card p-5" key={stat.label}><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-600">{stat.label}</p><stat.icon className="size-5 text-emerald-700" /></div><p className="mt-4 font-mono text-3xl font-bold text-slate-950">{stat.value}</p></div>)}
      </div>
      <section className="mt-7">
        <h3 className="mb-4 text-lg font-bold text-slate-950">Acciones frecuentes</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {shortcuts.map((item) => <Link href={item.href} key={item.href} className="card focus-ring group p-6 transition hover:-translate-y-0.5 hover:border-emerald-300"><item.icon className="size-7 text-emerald-700" /><h4 className="mt-5 font-bold text-slate-950 group-hover:text-emerald-800">{item.title}</h4><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p></Link>)}
        </div>
      </section>
    </>
  );
}
