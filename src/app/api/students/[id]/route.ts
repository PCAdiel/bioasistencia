import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { assertSameOrigin, safeError } from "@/lib/security";
import { studentUpdateSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await getSession();
    if (!user || user.role !== "admin") return NextResponse.json({ message: "No autorizado." }, { status: 403 });
    const input = studentUpdateSchema.parse(await request.json());
    const { id } = await params;
    const rows = await getSql()`
      UPDATE students SET dni=${input.dni}, institutional_code=${input.institutionalCode}, first_names=${input.firstNames}, last_names=${input.lastNames}, status=${input.status}, updated_at=NOW()
      WHERE id=${id} RETURNING id
    `;
    if (!rows[0]) return NextResponse.json({ message: "Alumno no encontrado." }, { status: 404 });
    await audit({ userId: user.id, action: "student.updated", entity: "student", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ message: safeError(error) }, { status: 400 }); }
}
