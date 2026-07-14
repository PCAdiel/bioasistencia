import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { decryptDescriptor } from "@/lib/crypto";
import { getSql } from "@/lib/db";
import { euclideanDistance, matchThreshold } from "@/lib/face";
import { assertSameOrigin, clientIp, rateLimit, safeError } from "@/lib/security";
import { attendanceSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await getSession();
    if (!user) return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    if (!rateLimit(`recognize:${clientIp(request)}`, 20, 60_000)) return NextResponse.json({ message: "Demasiadas verificaciones. Espera un momento." }, { status: 429 });
    const input = attendanceSchema.parse(await request.json());
    const sql = getSql();
    const templates = await sql`
      SELECT s.id, s.first_names, s.last_names, b.descriptor_ciphertext, b.descriptor_iv
      FROM biometric_templates b JOIN students s ON s.id=b.student_id
      WHERE s.status='active' ORDER BY s.id LIMIT 2000
    `;
    let best: { id: string; name: string; distance: number } | null = null;
    for (const template of templates) {
      try {
        const stored = await decryptDescriptor(String(template.descriptor_ciphertext), String(template.descriptor_iv));
        const distance = euclideanDistance(input.descriptor, stored);
        if (!best || distance < best.distance) best = { id: String(template.id), name: `${template.first_names} ${template.last_names}`, distance };
      } catch { /* Un registro dañado no bloquea los demás. */ }
    }
    if (!best || best.distance >= matchThreshold()) return NextResponse.json({ message: "Rostro no reconocido. Verifica iluminación y distancia." }, { status: 404 });

    const existing = await sql`
      SELECT id, entry_at, exit_at FROM attendance
      WHERE student_id=${best.id} AND attendance_date=(NOW() AT TIME ZONE 'America/Lima')::date AND course_id IS NULL LIMIT 1
    `;
    let status: "entry" | "exit" | "complete" = "entry";
    if (!existing[0]) {
      await sql`INSERT INTO attendance (student_id, match_distance) VALUES (${best.id}, ${best.distance})`;
    } else if (!existing[0].exit_at && Date.now() - new Date(String(existing[0].entry_at)).getTime() >= 5 * 60_000) {
      await sql`UPDATE attendance SET exit_at=NOW(), updated_at=NOW(), match_distance=${best.distance} WHERE id=${existing[0].id}`;
      status = "exit";
    } else {
      status = "complete";
    }
    const now = await sql`SELECT TO_CHAR(NOW() AT TIME ZONE 'America/Lima', 'HH24:MI:SS') AS time`;
    await audit({ userId: user.id, action: `attendance.${status}`, entity: "student", entityId: best.id, metadata: { distance: Number(best.distance.toFixed(6)) } });
    return NextResponse.json({ status, name: best.name, time: String(now[0].time), distance: best.distance });
  } catch (error) { return NextResponse.json({ message: safeError(error) }, { status: 400 }); }
}
