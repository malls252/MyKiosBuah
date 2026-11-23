// [AI] prompt: "Buat scripts/migrate.ts untuk menjalankan file SQL di db/migrations secara berurutan dengan pelacakan tabel schema_migrasi dan eksekusi transaksi per file."
import fs from "fs";
import path from "path";
import { Pool } from "pg";

// [AI] prompt: "Fungsi utama jalankanMigrasi membaca DATABASE_URL, memastikan tabel schema_migrasi, mengeksekusi file SQL baru dalam transaksi per file, dan mencetak ringkasan."
async function jalankanMigrasi(): Promise<void> {
  const databaseUrl =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

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
    // 1. Pastikan tabel pencatat schema_migrasi tersedia
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrasi (
        id_migrasi SERIAL PRIMARY KEY,
        nama_file VARCHAR(255) NOT NULL UNIQUE,
        waktu_jalan TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Ambil daftar migrasi yang sudah pernah dijalankan sebelumnya
    const hasilSudahJalan = await client.query<{ nama_file: string }>(
      "SELECT nama_file FROM schema_migrasi ORDER BY id_migrasi ASC"
    );
    const daftarSudahJalan = new Set(
      hasilSudahJalan.rows.map((row) => row.nama_file)
    );

    // 3. Baca semua file .sql dari folder db/migrations dan urutkan namanya
    const folderMigrasi = path.resolve(process.cwd(), "db/migrations");
    if (!fs.existsSync(folderMigrasi)) {
      console.log(`📁 Folder migrasi tidak ditemukan di: ${folderMigrasi}`);
      return;
    }

    const semuaFile = fs
      .readdirSync(folderMigrasi)
      .filter((file) => file.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (semuaFile.length === 0) {
      console.log("ℹ️ Tidak ada file migrasi (.sql) di folder db/migrations.");
      return;
    }

    console.log(`\n📦 Memulai proses migrasi basis data (${semuaFile.length} file terdeteksi)...`);

    const fileDijalankan: string[] = [];
    const fileDilewati: string[] = [];

    // 4. Jalankan setiap file dalam satu transaksi
    for (const file of semuaFile) {
      if (daftarSudahJalan.has(file)) {
        fileDilewati.push(file);
        continue;
      }

      const pathFile = path.join(folderMigrasi, file);
      const isiSql = fs.readFileSync(pathFile, "utf-8");

      console.log(`⏳ Menjalankan migrasi: ${file}...`);

      try {
        await client.query("BEGIN");
        await client.query(isiSql);
        await client.query(
          "INSERT INTO schema_migrasi (nama_file) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");

        fileDijalankan.push(file);
        console.log(`✅ Berhasil: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`\n❌ Gagal menjalankan migrasi pada file: ${file}`);
        console.error(`   Pesan error: ${(err as Error).message}`);
        process.exit(1);
      }
    }

    // 5. Cetak ringkasan migrasi
    console.log("\n================ RINGKASAN MIGRASI ================");
    console.log(`Total file terdeteksi : ${semuaFile.length}`);
    console.log(`File dijalankan       : ${fileDijalankan.length}`);
    if (fileDijalankan.length > 0) {
      fileDijalankan.forEach((f) => console.log(`  + ${f}`));
    }
    console.log(`File dilewati         : ${fileDilewati.length}`);
    if (fileDilewati.length > 0) {
      fileDilewati.forEach((f) => console.log(`  - ${f} (sudah pernah dijalankan)`));
    }
    console.log("===================================================\n");
  } finally {
    client.release();
    await pool.end();
  }
}

// [AI] prompt: "Panggil fungsi jalankanMigrasi dan tangani error unhandled."
jalankanMigrasi().catch((error) => {
  console.error("❌ Terjadi kesalahan tak terduga pada script migrasi:", error);
  process.exit(1);
});
