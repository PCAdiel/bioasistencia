"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function CourseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setMessage(data.message || "No se pudo crear el curso.");
    form.reset(); setMessage("Curso creado correctamente."); router.refresh();
  }
  return (
    <form onSubmit={submit} className="card mb-6 grid gap-4 p-5 sm:grid-cols-[0.45fr_1fr_auto] sm:items-end">
      <div><label className="label" htmlFor="code">Código</label><input className="input" id="code" name="code" placeholder="SIS-301" required /></div>
      <div><label className="label" htmlFor="name">Nombre del curso</label><input className="input" id="name" name="name" required /></div>
      <button className="btn btn-primary" disabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}Agregar</button>
      {message && <p className="text-sm text-slate-600 sm:col-span-3">{message}</p>}
    </form>
  );
}
