import { getSql } from "./db";

type AuditInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function audit(input: AuditInput) {
  const sql = getSql();
  await sql`
    INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata)
    VALUES (${input.userId ?? null}, ${input.action}, ${input.entity}, ${input.entityId ?? null}, ${JSON.stringify(input.metadata ?? {})}::jsonb)
  `;
}
