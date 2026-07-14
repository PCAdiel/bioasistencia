import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSql } from "@/lib/db";

function cell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ message: "Fecha inválida." }, { status: 400 });
  const rows = await getSql()`
    SELECT s.dni, s.institutional_code, s.last_names, s.first_names,
      TO_CHAR(a.entry_at AT TIME ZONE 'America/Lima', 'HH24:MI:SS') AS entry,
      TO_CHAR(a.exit_at AT TIME ZONE 'America/Lima', 'HH24:MI:SS') AS exit
    FROM students s LEFT JOIN attendance a ON a.student_id=s.id AND a.attendance_date=${date}::date AND a.course_id IS NULL
    WHERE s.status='active' ORDER BY s.last_names, s.first_names
  `;
  const lines = ["DNI,Codigo,Apellidos,Nombres,Entrada,Salida,Estado", ...rows.map((row) => [row.dni, row.institutional_code, row.last_names, row.first_names, row.entry, row.exit, row.entry ? "Asistio" : "Falta"].map(cell).join(","))];
  return new NextResponse(`\uFEFF${lines.join("\r\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="asistencia-${date}.csv"`, "Cache-Control": "no-store" } });
}
