import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { assertSameOrigin, clientIp, rateLimit, safeError } from "@/lib/security";
import { setupSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    if (!rateLimit(`setup:${clientIp(request)}`, 4, 15 * 60_000)) return NextResponse.json({ message: "Demasiados intentos." }, { status: 429 });
    const input = setupSchema.parse(await request.json());
    const sql = getSql();
    const count = await sql`SELECT COUNT(*)::int AS count FROM users`;
    if (Number(count[0]?.count ?? 0) > 0) return NextResponse.json({ message: "La configuración inicial ya fue completada." }, { status: 409 });
    const passwordHash = await hash(input.password, 12);
    const rows = await sql`
      INSERT INTO users (email, full_name, password_hash, role)
      VALUES (${input.email}, ${input.name}, ${passwordHash}, 'admin')
      RETURNING id, email, full_name, role
    `;
    const user = rows[0];
    await createSession({ id: String(user.id), email: String(user.email), name: String(user.full_name), role: "admin" });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: safeError(error) }, { status: 400 });
  }
}
