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

-- ---------------------------------------------------------------------
-- TABEL   : satuan  (Tugas 4 - 5.4.3)
-- MODUL   : Modul Data Master Buah
-- PEMILIK : Elvya Lestari Pakpahan - 23083000086
-- BRANCH  : feature/elvya-data-master
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE satuan dengan id_satuan IDENTITY, nama_satuan VARCHAR(30) UNIQUE NOT NULL, dan kolom bernama simbol VARCHAR(10) UNIQUE NOT NULL (bukan singkatan)."
CREATE TABLE satuan (
    id_satuan    INTEGER GENERATED ALWAYS AS IDENTITY,
    nama_satuan  VARCHAR(30) NOT NULL,
    simbol       VARCHAR(10) NOT NULL,
    CONSTRAINT pk_satuan           PRIMARY KEY (id_satuan),
    CONSTRAINT uq_satuan_nama      UNIQUE (nama_satuan),
    CONSTRAINT uq_satuan_simbol    UNIQUE (simbol)
);

-- ---------------------------------------------------------------------
-- TABEL   : buah  (Tugas 4 - 5.4.4)
-- MODUL   : Modul Data Master Buah
-- PEMILIK : Elvya Lestari Pakpahan - 23083000086
-- BRANCH  : feature/elvya-data-master
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE buah dengan id_buah IDENTITY, FK id_kategori dan id_satuan NOT NULL, nama_buah VARCHAR(100) UNIQUE NOT NULL, harga_per_kg NUMERIC(10,2) NOT NULL CHECK >= 0, stok_minimum NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK >= 0, aktif BOOLEAN NOT NULL DEFAULT TRUE. FK memakai ON DELETE RESTRICT ON UPDATE RESTRICT."
CREATE TABLE buah (
    id_buah        INTEGER GENERATED ALWAYS AS IDENTITY,
    id_kategori    INTEGER        NOT NULL,
    id_satuan      INTEGER        NOT NULL,
    nama_buah      VARCHAR(100)   NOT NULL,
    harga_per_kg   NUMERIC(10,2)  NOT NULL,
    stok_minimum   NUMERIC(10,3)  NOT NULL DEFAULT 0,
    aktif          BOOLEAN        NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_buah           PRIMARY KEY (id_buah),
    CONSTRAINT uq_buah_nama      UNIQUE (nama_buah),
    CONSTRAINT fk_buah_kategori  FOREIGN KEY (id_kategori) REFERENCES kategori (id_kategori)
                                 ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_buah_satuan    FOREIGN KEY (id_satuan)   REFERENCES satuan (id_satuan)
                                 ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_buah_harga    CHECK (harga_per_kg >= 0),
    CONSTRAINT chk_buah_stokmin  CHECK (stok_minimum >= 0)
);

-- ---------------------------------------------------------------------
-- TABEL   : stok_masuk  (Tugas 4 - 5.4.5)
-- Header penerimaan stok (pembelian buah oleh pemilik)
-- MODUL   : Modul Stok Masuk, Batch, dan Alokasi FIFO
-- PEMILIK : Elvya Lestari Pakpahan - 23083000086
-- BRANCH  : feature/elvya-stok-fifo
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE stok_masuk sebagai HEADER penerimaan stok: id_stok_masuk IDENTITY, FK id_pengguna NOT NULL, tanggal_masuk TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, total_biaya NUMERIC(12,2) NULL CHECK >= 0, catatan VARCHAR(255) NULL. JANGAN tambahkan id_buah, berat_kg, atau harga_beli_per_kg di sini (itu milik batch_stok)."
CREATE TABLE stok_masuk (
    id_stok_masuk  INTEGER GENERATED ALWAYS AS IDENTITY,
    id_pengguna    INTEGER        NOT NULL,
    tanggal_masuk  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_biaya    NUMERIC(12,2),
    catatan        VARCHAR(255),
    CONSTRAINT pk_stok_masuk           PRIMARY KEY (id_stok_masuk),
    CONSTRAINT fk_stok_masuk_pengguna  FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
                                       ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_stok_masuk_biaya    CHECK (total_biaya >= 0)
);

-- ---------------------------------------------------------------------
-- TABEL   : batch_stok  (Tugas 4 - 5.4.6)
-- Satuan stok per penerimaan per buah; unit pengurangan metode FIFO.
-- MODUL   : Modul Stok Masuk, Batch, dan Alokasi FIFO
-- PEMILIK : Elvya Lestari Pakpahan - 23083000086
-- BRANCH  : feature/elvya-stok-fifo
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE batch_stok dengan id_batch IDENTITY, FK id_buah NOT NULL, FK id_stok_masuk NOT NULL, jumlah_masuk_kg NUMERIC(10,3) NOT NULL CHECK > 0, sisa_kg NUMERIC(10,3) NOT NULL CHECK 0 <= sisa_kg <= jumlah_masuk_kg, harga_beli_per_kg NUMERIC(10,2) NULL CHECK >= 0, status_batch enum_status_batch NOT NULL DEFAULT 'Tersedia'. Jangan pindahkan harga_beli_per_kg ke stok_masuk dan jangan hilangkan status_batch."
CREATE TABLE batch_stok (
    id_batch          INTEGER GENERATED ALWAYS AS IDENTITY,
    id_buah           INTEGER        NOT NULL,
    id_stok_masuk     INTEGER        NOT NULL,
    jumlah_masuk_kg   NUMERIC(10,3)  NOT NULL,
    sisa_kg           NUMERIC(10,3)  NOT NULL,
    harga_beli_per_kg NUMERIC(10,2),
    status_batch      enum_status_batch NOT NULL DEFAULT 'Tersedia',
    CONSTRAINT pk_batch_stok              PRIMARY KEY (id_batch),
    CONSTRAINT fk_batch_stok_buah         FOREIGN KEY (id_buah)       REFERENCES buah (id_buah)
                                          ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_batch_stok_stok_masuk   FOREIGN KEY (id_stok_masuk) REFERENCES stok_masuk (id_stok_masuk)
                                          ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_batch_stok_jumlah      CHECK (jumlah_masuk_kg > 0),
    CONSTRAINT chk_batch_stok_sisa        CHECK (sisa_kg >= 0 AND sisa_kg <= jumlah_masuk_kg),
    CONSTRAINT chk_batch_stok_harga       CHECK (harga_beli_per_kg >= 0)
);

-- [AI] prompt: "Buat indeks idx_batch_fifo pada batch_stok (id_buah, status_batch, id_batch) sesuai Tugas 4 bagian 5.4.6 untuk mempercepat pencarian batch tertua per buah pada alokasi FIFO."
CREATE INDEX idx_batch_fifo ON batch_stok (id_buah, status_batch, id_batch);

-- ---------------------------------------------------------------------
-- TABEL   : transaksi  (Tugas 4 - 5.4.7)
-- Header penjualan langsung di kios.
-- MODUL   : Modul Transaksi Kasir
-- PEMILIK : Dwi Hikmal Akbar Ramadhan - 23083000096
-- BRANCH  : feature/hikmal-transaksi-kasir
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE transaksi dengan id_transaksi IDENTITY, FK id_pengguna NOT NULL (kasir), tanggal_waktu TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, total_bruto NUMERIC(12,2) NOT NULL CHECK >= 0, total_diskon NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK >= 0, total_bayar NUMERIC(12,2) NOT NULL CHECK total_bayar = total_bruto - total_diskon, metode_bayar enum_metode_bayar NOT NULL, uang_diterima NUMERIC(12,2) NULL, kembalian NUMERIC(12,2) NULL. Tambahkan CHECK: metode_bayar = 'QRIS' OR (uang_diterima IS NOT NULL AND uang_diterima >= total_bayar AND kembalian = uang_diterima - total_bayar)."
CREATE TABLE transaksi (
    id_transaksi    INTEGER GENERATED ALWAYS AS IDENTITY,
    id_pengguna     INTEGER            NOT NULL,
    tanggal_waktu   TIMESTAMPTZ        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_bruto     NUMERIC(12,2)      NOT NULL,
    total_diskon    NUMERIC(12,2)      NOT NULL DEFAULT 0,
    total_bayar     NUMERIC(12,2)      NOT NULL,
    metode_bayar    enum_metode_bayar  NOT NULL,
    uang_diterima   NUMERIC(12,2),
    kembalian       NUMERIC(12,2),
    CONSTRAINT pk_transaksi             PRIMARY KEY (id_transaksi),
    CONSTRAINT fk_transaksi_pengguna    FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
                                        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_transaksi_bruto      CHECK (total_bruto >= 0),
    CONSTRAINT chk_transaksi_diskon     CHECK (total_diskon >= 0),
    CONSTRAINT chk_transaksi_total      CHECK (total_bayar = total_bruto - total_diskon),
    CONSTRAINT chk_transaksi_pembayaran CHECK (
        metode_bayar = 'QRIS'
        OR (uang_diterima IS NOT NULL
            AND uang_diterima >= total_bayar
            AND kembalian = uang_diterima - total_bayar)
    )
);

-- [AI] prompt: "Buat indeks idx_transaksi_waktu pada transaksi (tanggal_waktu) untuk laporan penjualan per periode (Tugas 4 bagian 5.4.7)."
CREATE INDEX idx_transaksi_waktu ON transaksi (tanggal_waktu);

-- ---------------------------------------------------------------------
-- TABEL   : detail_transaksi  (Tugas 4 - 5.4.8)
-- Rincian buah pada satu transaksi.
-- MODUL   : Modul Transaksi Kasir
-- PEMILIK : Dwi Hikmal Akbar Ramadhan - 23083000096
-- BRANCH  : feature/hikmal-transaksi-kasir
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE detail_transaksi dengan id_detail_transaksi IDENTITY, FK id_transaksi NOT NULL, FK id_buah NOT NULL, berat_kg NUMERIC(10,3) NOT NULL CHECK > 0, harga_satuan NUMERIC(10,2) NOT NULL CHECK >= 0, diskon NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK >= 0, subtotal NUMERIC(12,2) NOT NULL CHECK >= 0. Tambahkan UNIQUE (id_transaksi, id_buah)."
CREATE TABLE detail_transaksi (
    id_detail_transaksi INTEGER GENERATED ALWAYS AS IDENTITY,
    id_transaksi        INTEGER        NOT NULL,
    id_buah             INTEGER        NOT NULL,
    berat_kg            NUMERIC(10,3)  NOT NULL,
    harga_satuan        NUMERIC(10,2)  NOT NULL,
    diskon              NUMERIC(12,2)  NOT NULL DEFAULT 0,
    subtotal            NUMERIC(12,2)  NOT NULL,
    CONSTRAINT pk_detail_transaksi             PRIMARY KEY (id_detail_transaksi),
    CONSTRAINT fk_detail_transaksi_transaksi   FOREIGN KEY (id_transaksi) REFERENCES transaksi (id_transaksi)
                                               ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_detail_transaksi_buah        FOREIGN KEY (id_buah)      REFERENCES buah (id_buah)
                                               ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT uq_detail_transaksi_buah        UNIQUE (id_transaksi, id_buah),
    CONSTRAINT chk_detail_transaksi_berat      CHECK (berat_kg > 0),
    CONSTRAINT chk_detail_transaksi_harga      CHECK (harga_satuan >= 0),
    CONSTRAINT chk_detail_transaksi_diskon     CHECK (diskon >= 0),
    CONSTRAINT chk_detail_transaksi_subtotal   CHECK (subtotal >= 0)
);

-- ---------------------------------------------------------------------
-- TABEL   : pesanan  (Tugas 4 - 5.4.9)
-- Header pesanan online.
-- MODUL   : Modul Pesanan Online
-- PEMILIK : Dwi Hikmal Akbar Ramadhan - 23083000096
-- BRANCH  : feature/hikmal-pesanan-online
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE pesanan dengan id_pesanan IDENTITY, FK id_pengguna NOT NULL (pembeli), tanggal_pesanan TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, metode_pengiriman enum_metode_pengiriman NOT NULL, alamat_kirim VARCHAR(255) NULL, biaya_antar NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK >= 0, metode_bayar enum_metode_bayar NOT NULL, status_pesanan enum_status_pesanan NOT NULL DEFAULT 'Sedang Disiapkan', total_pesanan NUMERIC(12,2) NOT NULL CHECK >= 0. Tambahkan dua CHECK: (Diantar wajib alamat) OR (Ambil di Kios biaya_antar = 0); dan (metode_pengiriman = 'Diantar' OR status_pesanan <> 'Sedang Diantar')."
CREATE TABLE pesanan (
    id_pesanan          INTEGER GENERATED ALWAYS AS IDENTITY,
    id_pengguna         INTEGER                NOT NULL,
    tanggal_pesanan     TIMESTAMPTZ            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metode_pengiriman   enum_metode_pengiriman NOT NULL,
    alamat_kirim        VARCHAR(255),
    biaya_antar         NUMERIC(10,2)          NOT NULL DEFAULT 0,
    metode_bayar        enum_metode_bayar      NOT NULL,
    status_pesanan      enum_status_pesanan    NOT NULL DEFAULT 'Sedang Disiapkan',
    total_pesanan       NUMERIC(12,2)          NOT NULL,
    CONSTRAINT pk_pesanan                 PRIMARY KEY (id_pesanan),
    CONSTRAINT fk_pesanan_pengguna        FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
                                          ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_pesanan_biaya          CHECK (biaya_antar >= 0),
    CONSTRAINT chk_pesanan_total          CHECK (total_pesanan >= 0),
    CONSTRAINT chk_pesanan_alamat         CHECK (
        (metode_pengiriman = 'Diantar' AND alamat_kirim IS NOT NULL)
        OR (metode_pengiriman = 'Ambil di Kios' AND biaya_antar = 0)
    ),
    CONSTRAINT chk_pesanan_status_antar   CHECK (
        metode_pengiriman = 'Diantar'
        OR status_pesanan <> 'Sedang Diantar'
    )
);

-- [AI] prompt: "Buat indeks idx_pesanan_pembeli pada pesanan (id_pengguna, status_pesanan) dan idx_pesanan_tanggal pada pesanan (tanggal_pesanan) sesuai Tugas 4 bagian 5.4.9."
CREATE INDEX idx_pesanan_pembeli ON pesanan (id_pengguna, status_pesanan);
CREATE INDEX idx_pesanan_tanggal ON pesanan (tanggal_pesanan);

-- ---------------------------------------------------------------------
-- TABEL   : detail_pesanan  (Tugas 4 - 5.4.10)
-- Rincian buah pada satu pesanan.
-- MODUL   : Modul Pesanan Online
-- PEMILIK : Dwi Hikmal Akbar Ramadhan - 23083000096
-- BRANCH  : feature/hikmal-pesanan-online
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE detail_pesanan dengan id_detail_pesanan IDENTITY, FK id_pesanan NOT NULL, FK id_buah NOT NULL, berat_kg NUMERIC(10,3) NOT NULL CHECK > 0, harga_satuan NUMERIC(10,2) NOT NULL CHECK >= 0, subtotal NUMERIC(12,2) NOT NULL CHECK >= 0. Tambahkan UNIQUE (id_pesanan, id_buah)."
CREATE TABLE detail_pesanan (
    id_detail_pesanan  INTEGER GENERATED ALWAYS AS IDENTITY,
    id_pesanan         INTEGER        NOT NULL,
    id_buah            INTEGER        NOT NULL,
    berat_kg           NUMERIC(10,3)  NOT NULL,
    harga_satuan       NUMERIC(10,2)  NOT NULL,
    subtotal           NUMERIC(12,2)  NOT NULL,
    CONSTRAINT pk_detail_pesanan             PRIMARY KEY (id_detail_pesanan),
    CONSTRAINT fk_detail_pesanan_pesanan     FOREIGN KEY (id_pesanan) REFERENCES pesanan (id_pesanan)
                                             ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_detail_pesanan_buah        FOREIGN KEY (id_buah)    REFERENCES buah (id_buah)
                                             ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT uq_detail_pesanan_buah        UNIQUE (id_pesanan, id_buah),
    CONSTRAINT chk_detail_pesanan_berat      CHECK (berat_kg > 0),
    CONSTRAINT chk_detail_pesanan_harga      CHECK (harga_satuan >= 0),
    CONSTRAINT chk_detail_pesanan_subtotal   CHECK (subtotal >= 0)
);

