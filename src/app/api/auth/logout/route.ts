import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch { return NextResponse.json({ message: "Origen no autorizado." }, { status: 403 }); }
  await clearSession();
  return NextResponse.json({ ok: true });
}
