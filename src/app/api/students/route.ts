import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { encryptDescriptor } from "@/lib/crypto";
import { getSql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { assertSameOrigin, safeError } from "@/lib/security";
import { studentSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await getSession();
    if (!user || user.role !== "admin") return NextResponse.json({ message: "No autorizado." }, { status: 403 });
    const input = studentSchema.parse(await request.json());
    const encrypted = await encryptDescriptor(input.descriptor);
    const rows = await getSql()`
      WITH new_student AS (
        INSERT INTO students (dni, institutional_code, first_names, last_names, consent_at)
        VALUES (${input.dni}, ${input.institutionalCode}, ${input.firstNames}, ${input.lastNames}, NOW())
        RETURNING id
      )
      INSERT INTO biometric_templates (student_id, descriptor_ciphertext, descriptor_iv, sample_count)
      SELECT id, ${encrypted.ciphertext}, ${encrypted.iv}, ${input.samples} FROM new_student
      RETURNING student_id
    `;
    const studentId = String(rows[0].student_id);
    await audit({ userId: user.id, action: "student.created", entity: "student", entityId: studentId });
    return NextResponse.json({ id: studentId }, { status: 201 });
  } catch (error) {
    const code = (error as { code?: string }).code;
    return NextResponse.json({ message: code === "23505" ? "El DNI o código institucional ya existe." : safeError(error) }, { status: code === "23505" ? 409 : 400 });
  }
}
