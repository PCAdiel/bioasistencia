import { NextRequest } from "next/server";

const attempts = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host || new URL(origin).host !== host) throw new Error("Origen no autorizado.");
}

export function safeError(error: unknown) {
  if (process.env.NODE_ENV !== "production") console.error(error);
  return "No se pudo completar la operación.";
}
