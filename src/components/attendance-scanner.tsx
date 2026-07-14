"use client";

import { CheckCircle2, LoaderCircle, LogIn, LogOut, ScanFace } from "lucide-react";
import { useState } from "react";
import { FaceCapture } from "./face-capture";

type Result = { status: "entry" | "exit" | "complete"; name: string; time: string; distance: number };

export function AttendanceScanner() {
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [captureKey, setCaptureKey] = useState(0);

  async function mark() {
    if (!descriptor) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/attendance/recognize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor, livenessVerified: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "No se pudo marcar la asistencia.");
      setResult(data);
      setDescriptor(null);
      setCaptureKey((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ocurrió un error inesperado.");
    } finally { setLoading(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="card p-6"><FaceCapture key={captureKey} onDescriptor={setDescriptor} /></section>
      <section className="card flex min-h-80 flex-col justify-center p-7">
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><ScanFace /></div>
        <h3 className="text-xl font-bold">Resultado de marcación</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Primera verificación del día: entrada. Segunda verificación: salida.</p>
        {result && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="size-5" />{result.status === "entry" ? "Entrada registrada" : result.status === "exit" ? "Salida registrada" : "Jornada ya completada"}</div>
            <p className="mt-2 text-lg font-semibold">{result.name}</p>
            <p className="mt-1 text-sm">Hora: {result.time} · Distancia: {result.distance.toFixed(4)}</p>
          </div>
        )}
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <button onClick={mark} disabled={!descriptor || loading} className="btn btn-primary mt-6 w-full">
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : result?.status === "entry" ? <LogOut className="size-4" /> : <LogIn className="size-4" />}
          Confirmar marcación
        </button>
      </section>
    </div>
  );
}
