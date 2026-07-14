import { PageHeader } from "@/components/page-header";
import { UserForm } from "@/components/user-form";
import { requireSession } from "@/lib/auth";
import { getSql } from "@/lib/db";

export default async function UsersPage() { await requireSession(["admin"]); const users=await getSql()`SELECT id,email,full_name,role,active,created_at FROM users ORDER BY full_name`; return <><PageHeader title="Usuarios y permisos" description="Administradores y docentes autorizados para utilizar el sistema."/><UserForm/><section className="card table-wrap p-4"><table className="data-table"><thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th></tr></thead><tbody>{users.map((user)=><tr key={String(user.id)}><td className="font-semibold">{String(user.full_name)}</td><td>{String(user.email)}</td><td><span className="badge badge-neutral">{String(user.role)}</span></td><td><span className={`badge ${user.active?"badge-success":"badge-danger"}`}>{user.active?"Activo":"Inactivo"}</span></td></tr>)}</tbody></table></section></>; }
