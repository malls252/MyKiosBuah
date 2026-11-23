// [AI] prompt: "Buat src/lib/db.ts untuk koneksi basis data PostgreSQL (Neon) memakai library pg singleton pool dengan parameterized queries tanpa ORM."
import { Pool, QueryResult, QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Hanya lemparkan error saat runtime bukan build-time jika dipanggil
  if (process.env.NODE_ENV !== "production") {
    console.warn("⚠️ Peringatan: DATABASE_URL belum terdefinisi.");
  }
}

const butuhSsl = Boolean(
  connectionString &&
    (connectionString.includes("sslmode=require") ||
      connectionString.includes("neon.tech") ||
      process.env.NODE_ENV === "production")
);

// [AI] prompt: "Gunakan singleton pattern pada globalThis agar koneksi pool pg tidak bocor saat hot-reloading di Next.js."
const globalForDb = globalThis as unknown as { pool: Pool | undefined };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: connectionString || undefined,
    ssl: butuhSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

// [AI] prompt: "Fungsi pembungkus query SQL terparameterisasi dengan dukungan generic tipe data TypeScript."
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
