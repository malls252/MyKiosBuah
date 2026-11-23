// [AI] prompt: Inisialisasi pool koneksi PostgreSQL (pg) yang disimpan di globalThis untuk serverless/hot-reload dengan pengecekan DATABASE_URL saat pertama kali dipanggil
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

const globalUntukPg = globalThis as unknown as {
  pgPool: Pool | undefined;
};

// [AI] prompt: Dapatkan instance pool PostgreSQL tunggal (singleton) dengan batas maksimal 5 koneksi
function dapatkanPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('Variabel lingkungan DATABASE_URL belum diatur.');
  }

  if (!globalUntukPg.pgPool) {
    globalUntukPg.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
  }

  return globalUntukPg.pgPool;
}

// [AI] prompt: Fungsi query(teks, parameter) untuk menjalankan query SQL berparameter biasa melalui connection pool
export async function query<T extends QueryResultRow = QueryResultRow>(
  teks: string,
  parameter?: unknown[]
): Promise<QueryResult<T>> {
  const pool = dapatkanPool();
  return pool.query<T>(teks, parameter);
}

// [AI] prompt: Fungsi jalankanTransaksiDb(callback) untuk menjalankan transaksi SQL aman dengan BEGIN, COMMIT, ROLLBACK, dan pelepasan client di finally
export async function jalankanTransaksiDb<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = dapatkanPool();
  const client = await pool.connect();

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
