import postgres from "postgres";

type QueryRow = Record<string, unknown>;
type SqlClient = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<QueryRow[]>;

let client: SqlClient | null = null;

export function getSql() {
  if (!client) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL no está configurada.");
    }
    const sql = postgres(databaseUrl, {
      ssl: "require",
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      max_lifetime: 60 * 30,
    });
    client = sql as unknown as SqlClient;
  }
  return client;
}
