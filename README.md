# Aplikasi Website Kios Buah — Sistem Kasir dan Inventoris Stok FIFO

Proyek Mata Kuliah Project Sistem Informasi Terapan (MK54), Kelompok 3, Kelas 7A2,
Prodi S1 Sistem Informasi FTI UNMER Malang. Klien: Ali Mansur (pemilik kios buah, Pasuruan).

## Tim dan modul
| Anggota | Modul |
| --- | --- |
| Dwi Hikmal Akbar Ramadhan | Transaksi Kasir, Pesanan Online, Laporan & Peringatan |
| Elvya Lestari Pakpahan | Akun & Autentikasi, Data Master Buah, Stok Masuk/Batch & Alokasi FIFO |

## Stack final
Next.js (App Router) + TypeScript, CSS Modules, PostgreSQL (node-postgres), JWT (jose) + bcryptjs,
Zod, Vitest, ESLint + Prettier, hosting Netlify. Node.js 22 LTS (lihat `.nvmrc`).

## Struktur branch
- `main`  : siap produksi, hanya menerima merge dari `dev` lewat Pull Request
- `dev`   : integrasi
- `feature/<nama-anggota>-<modul>` : pengembangan individual, dibuat dari `dev`

## Konvensi commit
`feat:`, `fix:`, `docs:`, `test:` + deskripsi bahasa Indonesia.
Contoh: `feat: tambah perhitungan kembalian pada halaman kasir`

Kode hasil AI diberi komentar `// [AI] prompt: <isi prompt>`.

## Menjalankan secara lokal
1. `nvm use` lalu `npm install`
2. Salin `.env.example` menjadi `.env.local` dan isi nilainya
3. Jalankan migrasi basis data, lalu `npm run dev`

> Inisialisasi proyek Next.js dilakukan satu kali di branch `dev`: jalankan
> `npx create-next-app@latest` di folder sementara, lalu salin hasilnya ke repositori ini
> (jangan menimpa README, .gitignore, dan folder yang sudah ada).
