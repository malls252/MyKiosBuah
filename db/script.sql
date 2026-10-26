-- =====================================================================
-- TUGAS 6 - IMPLEMENTASI BASIS DATA
-- Proyek   : Aplikasi Website Kios Buah (MyKiosBuah) - Kasir & Inventori FIFO
-- Klien    : Ali Mansur (Kios Buah, Pasuruan)
-- Kelas    : 7A2 - Kelompok 3
-- DBMS     : PostgreSQL 16 atau lebih baru
-- Sumber   : Skema final Tugas 4 bagian 5 (11 tabel, PostgreSQL)
-- Repo     : https://github.com/malls252/MyKiosBuah.git
--
-- Anggota  : Dwi Hikmal Akbar Ramadhan - 23083000096 (GitHub: malls252)
--            Elvya Lestari Pakpahan    - 23083000086 (GitHub: elvya26)
--
--
-- Cara menjalankan (psql):
--   createdb -U postgres kios_buah
--   psql -U postgres -d kios_buah -f Tugas6_KiosBuah.sql
-- Skrip dapat dijalankan ulang: bagian 0 menghapus objek lama lebih dulu.
-- =====================================================================

-- [AI] prompt: "Buat header skrip SQL implementasi basis data untuk aplikasi Kios Buah (MyKiosBuah) yang merupakan revisi dari Tugas 6 agar persis sesuai skema Tugas 4 bagian 5: 11 tabel PostgreSQL, FK RESTRICT, presisi NUMERIC(10,3) untuk berat/stok, stok_masuk sebagai header, batch_stok sebagai unit FIFO, status_pesanan 3 nilai. Sertakan identitas kelompok, cara menjalankan, dan catatan revisi."

-- =====================================================================
-- 0. BERSIHKAN OBJEK LAMA (agar skrip bisa dijalankan ulang)
-- =====================================================================
-- [AI] prompt: "Tulis DROP TABLE IF EXISTS ... CASCADE dan DROP TYPE IF EXISTS ... untuk semua objek yang akan dibuat, dengan urutan terbalik dari ketergantungan FK, supaya skrip idempoten."
DROP TABLE IF EXISTS stok_keluar_fifo CASCADE;
DROP TABLE IF EXISTS detail_pesanan   CASCADE;
DROP TABLE IF EXISTS pesanan          CASCADE;
DROP TABLE IF EXISTS detail_transaksi CASCADE;
DROP TABLE IF EXISTS transaksi        CASCADE;
DROP TABLE IF EXISTS batch_stok       CASCADE;
DROP TABLE IF EXISTS stok_masuk       CASCADE;
DROP TABLE IF EXISTS buah             CASCADE;
DROP TABLE IF EXISTS satuan           CASCADE;
DROP TABLE IF EXISTS kategori         CASCADE;
DROP TABLE IF EXISTS pengguna         CASCADE;

DROP TYPE IF EXISTS enum_status_pesanan;
DROP TYPE IF EXISTS enum_metode_pengiriman;
DROP TYPE IF EXISTS enum_metode_bayar;
DROP TYPE IF EXISTS enum_peran;
DROP TYPE IF EXISTS enum_status_batch;

-- =====================================================================
-- 1. TIPE ENUM
--    Nilai sama persis dengan ERD Tugas 3 dan skema Tugas 4 bagian 5.4
-- =====================================================================
-- [AI] prompt: "Buat CREATE TYPE untuk lima ENUM sesuai Tugas 4 bagian 5.4: peran (Super Admin, Kasir, Pembeli); metode_bayar (Tunai, QRIS); metode_pengiriman (Diantar, Ambil di Kios); status_batch (Tersedia, Habis); status_pesanan (Sedang Disiapkan, Sedang Diantar, Selesai)."
CREATE TYPE enum_peran             AS ENUM ('Super Admin', 'Kasir', 'Pembeli');
CREATE TYPE enum_metode_bayar      AS ENUM ('Tunai', 'QRIS');
CREATE TYPE enum_metode_pengiriman AS ENUM ('Diantar', 'Ambil di Kios');
CREATE TYPE enum_status_batch      AS ENUM ('Tersedia', 'Habis');
CREATE TYPE enum_status_pesanan    AS ENUM ('Sedang Disiapkan', 'Sedang Diantar', 'Selesai');

-- =====================================================================
-- 2. CREATE TABLE
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABEL   : pengguna  (Tugas 4 - 5.4.1)
-- MODUL   : Modul Akun dan Autentikasi
-- PEMILIK : Elvya Lestari Pakpahan - 23083000086
-- BRANCH  : feature/elvya-akun-autentikasi
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE pengguna untuk 3 peran (Super Admin, Kasir, Pembeli) dengan PK id_pengguna IDENTITY, nama VARCHAR(100), email VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(100) NOT NULL, peran enum_peran NOT NULL, no_telepon VARCHAR(20), alamat VARCHAR(255), aktif BOOLEAN NOT NULL DEFAULT TRUE. Jangan tambahkan kolom di luar skema Tugas 4."
CREATE TABLE pengguna (
    id_pengguna      INTEGER GENERATED ALWAYS AS IDENTITY,
    nama             VARCHAR(100) NOT NULL,
    email            VARCHAR(100) NOT NULL,
    password_hash    VARCHAR(100) NOT NULL,
    peran            enum_peran   NOT NULL,
    no_telepon       VARCHAR(20),
    alamat           VARCHAR(255),
    aktif            BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_pengguna           PRIMARY KEY (id_pengguna),
    CONSTRAINT uq_pengguna_email     UNIQUE (email)
);

-- ---------------------------------------------------------------------
-- TABEL   : kategori  (Tugas 4 - 5.4.2)
-- MODUL   : Modul Data Master Buah
-- PEMILIK : Elvya Lestari Pakpahan - 23083000086
-- BRANCH  : feature/elvya-data-master
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE kategori dengan id_kategori IDENTITY, nama_kategori VARCHAR(50) UNIQUE NOT NULL, dan deskripsi VARCHAR(255) NULL (jangan hilangkan deskripsi)."
CREATE TABLE kategori (
    id_kategori    INTEGER GENERATED ALWAYS AS IDENTITY,
    nama_kategori  VARCHAR(50)  NOT NULL,
    deskripsi      VARCHAR(255),
    CONSTRAINT pk_kategori       PRIMARY KEY (id_kategori),
    CONSTRAINT uq_kategori_nama  UNIQUE (nama_kategori)
);

