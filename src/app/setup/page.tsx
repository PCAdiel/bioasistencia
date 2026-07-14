import { AuthForm } from "@/components/auth-form";
import { getSql } from "@/lib/db";
import { Database, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  let databaseReady = true;
  let userCount = 0;
  try {
    const rows = await getSql()`SELECT COUNT(*)::int AS count FROM users`;
    userCount = Number(rows[0]?.count ?? 0);
  } catch {
    databaseReady = false;
  }
  if (databaseReady && userCount > 0) redirect("/login");

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="card w-full max-w-lg p-7 sm:p-9">
        <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><ShieldCheck /></div>
        <h1 className="text-2xl font-bold text-slate-950">Configuración inicial</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-slate-600">Crea el primer administrador. Esta pantalla se desactiva automáticamente después.</p>
        {databaseReady ? <AuthForm mode="setup" /> : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="mb-2 flex items-center gap-2 font-bold"><Database className="size-4" />Base no inicializada</div>
            <p>Configura <code>DATABASE_URL</code> y ejecuta <code>database/migration.sql</code>. Después recarga esta página.</p>
          </div>
        )}
      </section>
    </main>
  );
}
