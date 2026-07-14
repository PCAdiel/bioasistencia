"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, LogIn, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "setup" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(mode === "setup" ? "/api/setup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "No se pudo iniciar la sesión.");
      router.push("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "setup" && (
        <div>
          <label className="label" htmlFor="name">Nombre completo</label>
          <input className="input focus-ring" id="name" name="name" autoComplete="name" required />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Correo institucional</label>
        <input className="input focus-ring" id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Contraseña</label>
        <input className="input focus-ring" id="password" name="password" type="password" minLength={10} autoComplete={mode === "setup" ? "new-password" : "current-password"} required />
        {mode === "setup" && <p className="mt-1 text-xs text-slate-500">Mínimo 10 caracteres.</p>}
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="btn btn-primary focus-ring w-full" disabled={loading}>
        {loading ? <LoaderCircle className="size-4 animate-spin" /> : mode === "setup" ? <ShieldCheck className="size-4" /> : <LogIn className="size-4" />}
        {mode === "setup" ? "Crear administrador" : "Ingresar"}
      </button>
    </form>
  );
}
