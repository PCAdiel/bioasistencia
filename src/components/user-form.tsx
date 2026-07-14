"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserForm() {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setMessage(""); const form=event.currentTarget; const response=await fetch("/api/users", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(Object.fromEntries(new FormData(form).entries())) }); const data=await response.json(); setLoading(false); if(!response.ok) return setMessage(data.message||"No se pudo crear."); form.reset(); setMessage("Usuario creado."); router.refresh(); }
  return <form onSubmit={submit} className="card mb-6 grid gap-4 p-5 md:grid-cols-4 md:items-end"><div><label className="label" htmlFor="name">Nombre</label><input className="input" id="name" name="name" required /></div><div><label className="label" htmlFor="email">Correo</label><input className="input" id="email" name="email" type="email" required /></div><div><label className="label" htmlFor="password">Contraseña temporal</label><input className="input" id="password" name="password" type="password" minLength={10} required /></div><div><label className="label" htmlFor="role">Rol</label><select className="input" id="role" name="role"><option value="docente">Docente</option><option value="admin">Administrador</option></select></div><button className="btn btn-primary md:col-span-4 md:w-fit" disabled={loading}>{loading?<LoaderCircle className="size-4 animate-spin"/>:<UserPlus className="size-4"/>}Crear usuario</button>{message&&<p className="text-sm text-slate-600 md:col-span-4">{message}</p>}</form>;
}
