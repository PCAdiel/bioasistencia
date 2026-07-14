"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaceCapture } from "./face-capture";

export function StudentEnrollmentForm() {
  const router = useRouter();
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!descriptor) return setError("Completa las tres verificaciones faciales.");
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      dni: form.get("dni"),
      institutionalCode: form.get("institutionalCode"),
      firstNames: form.get("firstNames"),
      lastNames: form.get("lastNames"),
      consent: form.get("consent") === "on",
      descriptor,
      samples: 3,
    };
    try {
      const response = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "No se pudo registrar al alumno.");
      router.push("/alumnos?created=1");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="card p-6">
        <h3 className="text-lg font-bold text-slate-950">Datos institucionales</h3>
        <p className="mb-5 mt-1 text-sm text-slate-600">Los campos se validan nuevamente en el servidor.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="dni">DNI</label><input className="input" id="dni" name="dni" inputMode="numeric" pattern="\d{8}" maxLength={8} required /></div>
          <div><label className="label" htmlFor="institutionalCode">Código institucional</label><input className="input" id="institutionalCode" name="institutionalCode" maxLength={30} required /></div>
          <div><label className="label" htmlFor="firstNames">Nombres</label><input className="input" id="firstNames" name="firstNames" required /></div>
          <div><label className="label" htmlFor="lastNames">Apellidos</label><input className="input" id="lastNames" name="lastNames" required /></div>
        </div>
        <label className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-5 text-emerald-950">
          <input className="mt-1 size-4" type="checkbox" name="consent" required />
          <span>Confirmo que se informó al titular sobre la finalidad, conservación y eliminación de su plantilla biométrica.</span>
        </label>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="btn btn-primary mt-5 w-full sm:w-auto" disabled={loading || !descriptor}>
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}Guardar alumno y biometría
        </button>
      </section>
      <section className="card p-6">
        <h3 className="text-lg font-bold text-slate-950">Enrolamiento facial</h3>
        <p className="mb-5 mt-1 text-sm text-slate-600">Se promedian tres muestras verificadas para mejorar la estabilidad.</p>
        <FaceCapture samples={3} onDescriptor={setDescriptor} />
      </section>
    </form>
  );
}
