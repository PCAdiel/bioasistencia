import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await getSession();
    if (!user || user.role !== "admin") return NextResponse.json({ message: "No autorizado." }, { status: 403 });
    const { id } = await params;
    await getSql()`DELETE FROM biometric_templates WHERE student_id=${id}`;
    await audit({ userId: user.id, action: "biometric.deleted", entity: "student", entityId: id });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ message: "No se pudo eliminar la plantilla." }, { status: 400 }); }
}
