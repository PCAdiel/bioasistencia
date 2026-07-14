"use client";

import { BookOpen, ClipboardCheck, GraduationCap, LayoutDashboard, LogOut, Menu, ScrollText, Shield, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/types";

const navigation = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/alumnos", label: "Alumnos", icon: GraduationCap },
  { href: "/asistencia", label: "Marcar asistencia", icon: ClipboardCheck },
  { href: "/reportes", label: "Reportes", icon: ScrollText },
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/auditoria", label: "Auditoría", icon: Shield, adminOnly: true },
  { href: "/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
];

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const visible = navigation.filter((item) => !item.adminOnly || user.role === "admin");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <span className="font-bold text-emerald-900">Asistencia Biométrica</span>
        <button className="focus-ring rounded-lg p-2" onClick={() => setOpen(!open)} aria-label="Abrir navegación">
          {open ? <X /> : <Menu />}
        </button>
      </header>

      <aside className={`${open ? "fixed inset-x-0 top-16 z-20 block" : "hidden"} border-r border-slate-800 bg-slate-950 text-slate-100 lg:sticky lg:top-0 lg:block lg:h-screen`}>
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 hidden px-3 py-3 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Sistema institucional</p>
            <h1 className="mt-1 text-xl font-bold">Asistencia Biométrica</h1>
          </div>
          <nav className="space-y-1" aria-label="Navegación principal">
            {visible.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>
                  <Icon className="size-[18px]" />{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-slate-800 pt-4">
            <div className="mb-3 px-3">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email} · {user.role}</p>
            </div>
            <button onClick={logout} className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-900 hover:text-white">
              <LogOut className="size-[18px]" />Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}
