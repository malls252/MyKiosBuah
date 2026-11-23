// [AI] prompt: Inisialisasi pool koneksi PostgreSQL (pg) singleton di globalThis untuk serverless/hot-reload, dengan dukungan SSL Neon dan pengecekan DATABASE_URL saat pertama kali dipanggil
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

const globalUntukPg = globalThis as unknown as {
  pgPool: Pool | undefined;
};

// [AI] prompt: Dapatkan instance pool PostgreSQL tunggal (singleton) dengan batas maksimal 5 koneksi dan SSL aman untuk Neon
export function dapatkanPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Variabel lingkungan DATABASE_URL belum diatur.');
  }

  if (!globalUntukPg.pgPool) {
    const butuhSsl = Boolean(
      connectionString.includes('sslmode=require') ||
        connectionString.includes('neon.tech') ||
        process.env.NODE_ENV === 'production'
    );

    globalUntukPg.pgPool = new Pool({
      connectionString,
      ssl: butuhSsl ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }

  return globalUntukPg.pgPool;
}

// [AI] prompt: Ekspor pool untuk kompatibilitas jika modul lain membutuhkannya langsung
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const instancePool = dapatkanPool();
    const value = (instancePool as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === 'function') {
      return value.bind(instancePool);
    }
    return value;
  },
});

// [AI] prompt: Fungsi query(teks, parameter) untuk menjalankan query SQL berparameter biasa melalui connection pool
export async function query<T extends QueryResultRow = QueryResultRow>(
  teks: string,
  parameter?: unknown[]
): Promise<QueryResult<T>> {
  const instancePool = dapatkanPool();
  return instancePool.query<T>(teks, parameter);
}

// [AI] prompt: Fungsi jalankanTransaksiDb(callback) untuk menjalankan transaksi SQL aman dengan BEGIN, COMMIT, ROLLBACK, dan pelepasan client di finally
export async function jalankanTransaksiDb<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const instancePool = dapatkanPool();
  const client = await instancePool.connect();

  try {
    await client.query('BEGIN');
    const hasil = await callback(client);
    await client.query('COMMIT');
    return hasil;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
