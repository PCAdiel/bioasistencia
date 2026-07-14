import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { assertSameOrigin, clientIp, rateLimit } from "@/lib/security";
import { credentialsSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    if (!rateLimit(`login:${clientIp(request)}`, 8, 15 * 60_000)) return NextResponse.json({ message: "Espera antes de volver a intentarlo." }, { status: 429 });
    const input = credentialsSchema.parse(await request.json());
    const rows = await getSql()`
      SELECT id, email, full_name, password_hash, role FROM users
      WHERE email = ${input.email} AND active = TRUE LIMIT 1
    `;
    const user = rows[0];
    if (!user || !(await compare(input.password, String(user.password_hash)))) {
      return NextResponse.json({ message: "Correo o contraseña incorrectos." }, { status: 401 });
    }
    await createSession({ id: String(user.id), email: String(user.email), name: String(user.full_name), role: user.role as "admin" | "docente" });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "No se pudo iniciar la sesión." }, { status: 400 });
  }
}
