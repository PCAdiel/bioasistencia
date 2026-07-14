import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { assertSameOrigin, safeError } from "@/lib/security";
import { courseSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await getSession();
    if (!user || user.role !== "admin") return NextResponse.json({ message: "No autorizado." }, { status: 403 });
    const input = courseSchema.parse(await request.json());
    const rows = await getSql()`INSERT INTO courses (code, name) VALUES (${input.code.toUpperCase()}, ${input.name}) RETURNING id`;
    await audit({ userId: user.id, action: "course.created", entity: "course", entityId: String(rows[0].id) });
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (error) { return NextResponse.json({ message: (error as { code?: string }).code === "23505" ? "El código ya existe." : safeError(error) }, { status: 400 }); }
}
