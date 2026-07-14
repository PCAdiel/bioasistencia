import { AuthForm } from "@/components/auth-form";
import { getSql } from "@/lib/db";
import { ScanFace } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let databaseReady = true;
  let userCount = 1;
  try {
    const rows = await getSql()`SELECT COUNT(*)::int AS count FROM users`;
    userCount = Number(rows[0]?.count ?? 0);
  } catch {
    // La interfaz muestra la ayuda de configuración si la base aún no está lista.
    databaseReady = false;
  }
  if (databaseReady && userCount === 0) redirect("/setup");

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="card w-full max-w-md p-7 sm:p-9">
        <div className="mb-7 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><ScanFace /></div>
        <h1 className="text-2xl font-bold text-slate-950">Bienvenido</h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-slate-600">Ingresa para administrar alumnos, biometría y registros de asistencia.</p>
        <AuthForm mode="login" />
        <p className="mt-5 text-center text-xs text-slate-500">Primera instalación: <Link className="font-semibold text-emerald-700" href="/setup">configurar administrador</Link></p>
      </section>
    </main>
  );
}
