<!-- [AI] prompt: "Tulis README.md singkat berisi: nama tim dan NIM, stack, struktur branch, format commit, cara menjalankan, dan catatan wajib komentar [AI] prompt." -->
# MyKiosBuah — Sistem Kasir & Inventori Stok FIFO

Aplikasi Website Kios Buah untuk UMKM Kios Buah (Klien: Ali Mansur, Pasuruan).
Proyek Mata Kuliah Project Sistem Informasi Terapan (MK54), Kelompok 3, Kelas 7A2, Prodi S1 Sistem Informasi FTI Universitas Merdeka Malang.

## 👥 Tim Pengembang

| Nama | NIM | Tanggung Jawab Modul |
| --- | --- | --- |
| **Dwi Hikmal Akbar Ramadhan** | 23083000096 | Transaksi Kasir, Pesanan Online, Laporan & Peringatan |
| **Elvya Lestari Pakpahan** | 23083000086 | Akun & Autentikasi, Data Master Buah, Stok Masuk/Batch & Alokasi FIFO |

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js 22 LTS, Next.js (App Router), TypeScript (Strict Mode)
- **Basis Data:** PostgreSQL (Neon) via `pg` (parameterized queries, tanpa ORM)
- **Validasi:** Zod
- **Autentikasi & Keamanan:** JWT via `jose`, `bcryptjs`, Cookie `httpOnly`
- **Styling:** CSS Modules + Variabel CSS Global (Mobile-First, High-Fidelity)
- **Testing & Tooling:** Vitest, Prettier, ESLint, `tsx`

## 🌿 Struktur Branch

- `main` : Siap produksi, hanya menerima merge dari `dev` via Pull Request
- `dev` : Integrasi fitur
- `feature/<nama>-<modul>` : Pengembangan fitur individu (dibuat dari branch `dev`)
  - Contoh: `feature/hikmal-transaksi-kasir`, `feature/elvya-akun-autentikasi`

## 📝 Format Commit

Gunakan awalan konvensional diikuti deskripsi ringkas dalam bahasa Indonesia:
- `feat:` penambahan fitur baru
- `fix:` perbaikan bug/kesalahan
- `docs:` pembaruan dokumentasi
- `test:` penambahan atau penyesuaian unit test

Contoh: `feat: tambah perhitungan kembalian pada modul transaksi kasir`

## 🚀 Cara Menjalankan Secara Lokal

1. Pasang seluruh dependensi:
   ```bash
   npm install
   ```
2. Salin template konfigurasi environment:
   ```bash
   cp .env.example .env.local
   ```
   Lalu isi nilai `DATABASE_URL`, `JWT_SECRET`, dan `JWT_EXPIRES_IN` pada `.env.local`.
3. Jalankan migrasi basis data:
   ```bash
   npm run migrate
   ```
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
5. Untuk menjalankan pengujian:
   ```bash
   npm run test
   ```

## 🤖 Aturan Wajib Komentar Kode AI

Seluruh kode hasil bantuan AI wajib menyertakan komentar prompt tepat di atas setiap blok kode:
- **TypeScript/JavaScript/TSX:** `// [AI] prompt: <isi prompt>`
- **SQL:** `-- [AI] prompt: <isi prompt>`
- **CSS:** `/* [AI] prompt: <isi prompt> */`
