"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type EditableStudent = { id: string; dni: string; institutional_code: string; first_names: string; last_names: string; status: string; has_biometric: boolean };

export function StudentEditForm({ student }: { student: EditableStudent }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/students/${student.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setMessage(data.message || "No se pudo actualizar.");
    setMessage("Datos actualizados correctamente."); router.refresh();
  }

  async function removeBiometric() {
    if (!window.confirm("¿Eliminar definitivamente la plantilla biométrica? El alumno dejará de ser reconocido.")) return;
    setLoading(true); setMessage("");
    const response = await fetch(`/api/students/${student.id}/biometric`, { method: "DELETE" });
    const data = await response.json(); setLoading(false);
    setMessage(response.ok ? "Plantilla biométrica eliminada." : data.message || "No se pudo eliminar."); router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
      <form onSubmit={submit} className="card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="dni">DNI</label><input className="input" id="dni" name="dni" defaultValue={student.dni} maxLength={8} required /></div>
          <div><label className="label" htmlFor="institutionalCode">Código</label><input className="input" id="institutionalCode" name="institutionalCode" defaultValue={student.institutional_code} required /></div>
          <div><label className="label" htmlFor="firstNames">Nombres</label><input className="input" id="firstNames" name="firstNames" defaultValue={student.first_names} required /></div>
          <div><label className="label" htmlFor="lastNames">Apellidos</label><input className="input" id="lastNames" name="lastNames" defaultValue={student.last_names} required /></div>
          <div><label className="label" htmlFor="status">Estado</label><select className="input" id="status" name="status" defaultValue={student.status}><option value="active">Activo</option><option value="inactive">Inactivo</option></select></div>
        </div>
        {message && <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p>}
        <button className="btn btn-primary mt-5" disabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}Guardar cambios</button>
      </form>
      <aside className="card p-6">
        <h3 className="font-bold text-slate-950">Privacidad biométrica</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">La revocación del consentimiento requiere eliminar la plantilla asociada.</p>
        <p className="mt-4 text-sm">Estado: <span className={`badge ${student.has_biometric ? "badge-success" : "badge-neutral"}`}>{student.has_biometric ? "Plantilla disponible" : "Sin plantilla"}</span></p>
        <button type="button" onClick={removeBiometric} disabled={loading || !student.has_biometric} className="btn btn-danger mt-5 w-full"><Trash2 className="size-4" />Eliminar biometría</button>
      </aside>
    </div>
  );
}
