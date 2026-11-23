// [AI] prompt: "Peringatan keamanan: script ini khusus pengembangan untuk memperbarui password_hash semua akun sampel dan tidak boleh dijalankan di lingkungan produksi klien."
/**
 * ============================================================================
 * PERINGATAN KEAMANAN:
 * Script ini HANYA untuk kebutuhan pengembangan lokal dan pengujian data sampel.
 * JANGAN PERNAH menjalankan script ini di lingkungan basis data produksi klien (Ali Mansur)!
 * ============================================================================
 */

// [AI] prompt: "Buat scripts/set-password-sampel.ts untuk memperbarui password_hash seluruh akun pengguna dengan hash bcryptjs cost 10 dari argumen CLI."
import bcrypt from "bcryptjs";
import { Pool } from "pg";

// [AI] prompt: "Fungsi aturPasswordSampel membaca argumen CLI, hash password dengan bcrypt cost 10, memperbarui database, dan menampilkan daftar akun yang diubah tanpa menampilkan hash."
async function aturPasswordSampel(): Promise<void> {
  const passwordBaru = process.argv[2];

  if (!passwordBaru) {
    console.error("❌ Kesalahan: Password demo belum dimasukkan.");
    console.error("   Penggunaan: npm run password-sample -- <password-demo>");
    console.error("   Contoh    : npm run password-sample -- Password123!");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ Kesalahan: Environment variable DATABASE_URL belum disetel.");
    console.error("   Pastikan file .env.local sudah dibuat dan memuat DATABASE_URL yang valid.");
    process.exit(1);
  }

  const butuhSsl =
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("neon.tech") ||
    process.env.NODE_ENV === "production";

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: butuhSsl ? { rejectUnauthorized: false } : undefined,
  });

  const client = await pool.connect();

  try {
    console.log("🔒 Melakukan hashing kata sandi dengan bcryptjs (cost 10)...");
    const passwordHash = await bcrypt.hash(passwordBaru, 10);

    console.log("🔄 Memperbarui seluruh pengguna di tabel pengguna...");
    const hasil = await client.query<{
      id_pengguna: number;
      email: string;
      peran: string;
    }>(
      `UPDATE pengguna
       SET password_hash = $1
       RETURNING id_pengguna, email, peran`,
      [passwordHash]
    );

    if (hasil.rowCount === 0) {
      console.log("ℹ️ Tidak ada baris akun yang ditemukan di tabel pengguna.");
      return;
    }

    console.log(`\n✅ Berhasil memperbarui ${hasil.rowCount} akun pengguna:`);
    console.log("------------------------------------------------------------");
    console.log("| ID  | Peran        | Email                               |");
    console.log("------------------------------------------------------------");
    hasil.rows.forEach((user) => {
      const idStr = String(user.id_pengguna).padEnd(3);
      const peranStr = user.peran.padEnd(12);
      console.log(`| ${idStr} | ${peranStr} | ${user.email}`);
    });
    console.log("------------------------------------------------------------");
    console.log("Catatan: Hash kata sandi tidak ditampilkan demi alasan keamanan.\n");
  } finally {
    client.release();
    await pool.end();
  }
}

// [AI] prompt: "Eksekusi fungsi aturPasswordSampel dan tangani unhandled error."
aturPasswordSampel().catch((error) => {
  console.error("❌ Terjadi kesalahan tak terduga pada script:", error);
  process.exit(1);
});
