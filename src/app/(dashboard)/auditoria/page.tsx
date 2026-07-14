import { PageHeader } from "@/components/page-header";
import { requireSession } from "@/lib/auth";
import { getSql } from "@/lib/db";

export default async function AuditPage() {
  await requireSession(["admin"]);
  const rows = await getSql()`SELECT l.id, l.action, l.entity, l.entity_id, l.metadata, l.created_at, u.full_name FROM audit_logs l LEFT JOIN users u ON u.id=l.user_id ORDER BY l.created_at DESC LIMIT 200`;
  return <><PageHeader title="Auditoría del sistema" description="Trazabilidad de altas, cambios, eliminaciones biométricas y marcaciones." /><section className="card table-wrap p-4"><table className="data-table"><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Detalle</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-slate-500">Sin eventos registrados.</td></tr> : rows.map((row) => <tr key={String(row.id)}><td>{new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", dateStyle: "short", timeStyle: "medium" }).format(new Date(String(row.created_at)))}</td><td>{String(row.full_name ?? "Sistema")}</td><td className="font-mono text-xs">{String(row.action)}</td><td>{String(row.entity)}</td><td className="max-w-xs truncate font-mono text-xs text-slate-500">{JSON.stringify(row.metadata)}</td></tr>)}</tbody></table></section></>;
}
