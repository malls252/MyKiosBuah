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

-- ---------------------------------------------------------------------
-- TABEL   : stok_keluar_fifo  (Tugas 4 - 5.4.11)
-- Riwayat pengurangan stok per batch; satu detail dapat memakai beberapa batch.
-- MODUL   : Modul Stok Masuk, Batch, dan Alokasi FIFO
-- PEMILIK : Elvya Lestari Pakpahan - 23083000086
-- BRANCH  : feature/elvya-stok-fifo
-- ---------------------------------------------------------------------
-- [AI] prompt: "Buat CREATE TABLE stok_keluar_fifo dengan id_stok_keluar IDENTITY, FK id_batch NOT NULL, FK id_detail_transaksi NULL, FK id_detail_pesanan NULL, jumlah_keluar_kg NUMERIC(10,3) NOT NULL CHECK > 0. Tambahkan CHECK tepat satu sumber: (id_detail_transaksi IS NOT NULL AND id_detail_pesanan IS NULL) OR (id_detail_transaksi IS NULL AND id_detail_pesanan IS NOT NULL)."
CREATE TABLE stok_keluar_fifo (
    id_stok_keluar       INTEGER GENERATED ALWAYS AS IDENTITY,
    id_batch             INTEGER        NOT NULL,
    id_detail_transaksi  INTEGER,
    id_detail_pesanan    INTEGER,
    jumlah_keluar_kg     NUMERIC(10,3)  NOT NULL,
    CONSTRAINT pk_stok_keluar_fifo          PRIMARY KEY (id_stok_keluar),
    CONSTRAINT fk_stok_keluar_batch         FOREIGN KEY (id_batch)            REFERENCES batch_stok (id_batch)
                                            ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_stok_keluar_dtransaksi    FOREIGN KEY (id_detail_transaksi) REFERENCES detail_transaksi (id_detail_transaksi)
                                            ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_stok_keluar_dpesanan      FOREIGN KEY (id_detail_pesanan)   REFERENCES detail_pesanan (id_detail_pesanan)
                                            ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_stok_keluar_jumlah       CHECK (jumlah_keluar_kg > 0),
    CONSTRAINT chk_stok_keluar_sumber       CHECK (
        (id_detail_transaksi IS NOT NULL AND id_detail_pesanan IS NULL)
        OR (id_detail_transaksi IS NULL AND id_detail_pesanan IS NOT NULL)
    )
);

-- [AI] prompt: "Buat indeks manual pada stok_keluar_fifo untuk kolom FK id_batch, id_detail_transaksi, dan id_detail_pesanan karena PostgreSQL tidak membuat indeks otomatis untuk FK (Tugas 4 bagian 5.4.11)."
CREATE INDEX idx_stok_keluar_batch       ON stok_keluar_fifo (id_batch);
CREATE INDEX idx_stok_keluar_dtransaksi  ON stok_keluar_fifo (id_detail_transaksi);
CREATE INDEX idx_stok_keluar_dpesanan    ON stok_keluar_fifo (id_detail_pesanan);

-- =====================================================================
-- 3. DATA AWAL (INSERT)
--    Data fiktif tetapi realistis untuk kios buah di Pasuruan.
--    ID dibuat otomatis oleh IDENTITY berurutan mulai dari 1, sehingga
--    nilai FK di bawah merujuk ke urutan baris yang dimasukkan.
--    Seluruh akun demo memakai kata sandi: Password123!  (hash bcrypt)
-- =====================================================================
-- [AI] prompt: "Buat data awal realistis untuk kios buah di Pasuruan: 8 pengguna (1 Super Admin, 2 Kasir, 5 Pembeli), 5 kategori, 5 satuan, 10 buah, 12 stok_masuk header, 12 batch_stok (dengan dua batch apel dan dua batch pisang di tanggal berbeda untuk menguji FIFO), 6 transaksi (campuran Tunai/QRIS dengan uang_diterima dan kembalian NULL untuk QRIS), 11 detail_transaksi, 5 pesanan (campuran Diantar/Ambil di Kios dan status Sedang Disiapkan/Sedang Diantar/Selesai), 11 detail_pesanan, dan 23 stok_keluar_fifo yang konsisten dengan sisa_kg batch_stok."

-- ---- pengguna : 8 baris ---------------------------------------------
INSERT INTO pengguna (nama, email, password_hash, peran, no_telepon, alamat, aktif) VALUES
('Ali Mansur',        'ali.mansur@kiosbuah.test', '$2a$10$ETSI2a2.H.Cs8YyBzCEPIOH.8FCCA1NldjIljifxQZ2P4wp88Q.Oy', 'Super Admin', '081200000001', 'Jl. Panglima Sudirman No. 21, Pasuruan', TRUE),
('Rina Wulandari',    'rina.kasir@kiosbuah.test', '$2a$10$ETSI2a2.H.Cs8YyBzCEPIOH.8FCCA1NldjIljifxQZ2P4wp88Q.Oy', 'Kasir',       '081200000002', 'Jl. Soekarno Hatta No. 8, Pasuruan',      TRUE),
('Dimas Prasetyo',    'dimas.kasir@kiosbuah.test','$2a$10$ETSI2a2.H.Cs8YyBzCEPIOH.8FCCA1NldjIljifxQZ2P4wp88Q.Oy', 'Kasir',       '081200000003', 'Jl. Hasanudin No. 14, Pasuruan',          TRUE),
('Budi Santoso',      'budi.santoso@mail.test',   '$2a$10$ETSI2a2.H.Cs8YyBzCEPIOH.8FCCA1NldjIljifxQZ2P4wp88Q.Oy', 'Pembeli',     '081200000004', 'Jl. Ahmad Yani No. 5, Pasuruan',          TRUE),
('Lestari Handayani', 'lestari.h@mail.test',      '$2a$10$ETSI2a2.H.Cs8YyBzCEPIOH.8FCCA1NldjIljifxQZ2P4wp88Q.Oy', 'Pembeli',     '081200000005', 'Perum Bukit Sari Blok C-7, Pasuruan',     TRUE),
('Agus Setiawan',     'agus.setiawan@mail.test',  '$2a$10$ETSI2a2.H.Cs8YyBzCEPIOH.8FCCA1NldjIljifxQZ2P4wp88Q.Oy', 'Pembeli',     '081200000006', 'Jl. Gajah Mada No. 33, Pasuruan',         TRUE),
('Nur Aini',          'nur.aini@mail.test',       '$2a$10$ETSI2a2.H.Cs8YyBzCEPIOH.8FCCA1NldjIljifxQZ2P4wp88Q.Oy', 'Pembeli',     '081200000007', 'Jl. Dr. Wahidin No. 2, Pasuruan',         TRUE),
('Fajar Ramadhan',    'fajar.r@mail.test',        '$2a$10$ETSI2a2.H.Cs8YyBzCEPIOH.8FCCA1NldjIljifxQZ2P4wp88Q.Oy', 'Pembeli',     '081200000008', 'Jl. Pahlawan No. 17, Pasuruan',           TRUE);

-- ---- kategori : 5 baris ---------------------------------------------
INSERT INTO kategori (nama_kategori, deskripsi) VALUES
('Buah Lokal',       'Buah dari petani lokal Jawa Timur'),
('Buah Impor',       'Buah impor kualitas premium'),
('Buah Tropis',      'Buah khas daerah tropis'),
('Buah Musiman',     'Buah yang tersedia pada musim tertentu'),
('Parsel dan Paket', 'Paket parsel dan hampers buah');

-- ---- satuan : 5 baris -----------------------------------------------
INSERT INTO satuan (nama_satuan, simbol) VALUES
('Kilogram', 'kg'),
('Gram',     'g'),
('Ons',      'ons'),
('Pak',      'pak'),
('Peti',     'peti');

-- ---- buah : 10 baris ------------------------------------------------
INSERT INTO buah (id_kategori, id_satuan, nama_buah, harga_per_kg, stok_minimum, aktif) VALUES
(1, 1, 'Apel Malang',       28000,  5.000, TRUE),
(1, 1, 'Jeruk Medan',       25000,  8.000, TRUE),
(3, 1, 'Pisang Cavendish',  22000, 10.000, TRUE),
(4, 1, 'Mangga Arumanis',   30000,  8.000, TRUE),
(2, 1, 'Anggur Red Globe',  85000,  3.000, TRUE),
(4, 1, 'Semangka Merah',     9000, 15.000, TRUE),
(4, 1, 'Melon Hijau',       14000,  8.000, TRUE),
(3, 1, 'Pepaya California', 12000,  6.000, TRUE),
(3, 1, 'Alpukat Mentega',   32000,  5.000, TRUE),
(3, 1, 'Nanas Madu',        10000,  6.000, TRUE);

-- ---- stok_masuk : 12 baris (header saja) ----------------------------
INSERT INTO stok_masuk (id_pengguna, tanggal_masuk, total_biaya, catatan) VALUES
(1, '2026-10-12 08:00:00',  294000.00, 'Apel dari pemasok Batu, kiriman pagi'),   -- id 1  (14 x 21000)
(1, '2026-10-12 09:00:00',  720000.00, 'Jeruk Medan satu karung'),                -- id 2  (40 x 18000)
(1, '2026-10-13 08:30:00',  675000.00, 'Pisang Cavendish tandan'),                -- id 3  (45 x 15000)
(1, '2026-10-13 09:15:00',  770000.00, 'Mangga Arumanis dari Probolinggo'),       -- id 4  (35 x 22000)
(1, '2026-10-14 08:45:00', 1300000.00, 'Anggur impor, simpan di tempat sejuk'),   -- id 5  (20 x 65000)
(1, '2026-10-15 07:30:00',  440000.00, 'Semangka satu pickup'),                   -- id 6  (80 x 5500)
(1, '2026-10-15 08:00:00',  270000.00, 'Melon hijau'),                            -- id 7  (30 x 9000)
(1, '2026-10-20 08:10:00',  880000.00, 'Apel kiriman kedua'),                     -- id 8  (40 x 22000)
(1, '2026-10-21 08:20:00',  620000.00, 'Pisang kiriman kedua'),                   -- id 9  (40 x 15500)
(1, '2026-10-18 09:00:00',  600000.00, 'Alpukat mentega'),                        -- id 10 (25 x 24000)
(1, '2026-10-19 08:00:00',  225000.00, 'Pepaya California'),                      -- id 11 (30 x 7500)
(1, '2026-10-19 08:40:00',  180000.00, 'Nanas madu');                             -- id 12 (30 x 6000)

-- ---- batch_stok : 12 baris (satu batch per stok_masuk) --------------
-- sisa_kg = jumlah_masuk_kg dikurangi total stok_keluar_fifo pada batch tsb.
-- Urutan id_batch per buah mengikuti urutan masuk (dasar FIFO pada idx_batch_fifo).
-- [AI] prompt: "Lengkapi INSERT batch_stok 12 baris sesuai stok_masuk dengan sisa_kg yang konsisten terhadap stok_keluar_fifo, status_batch Habis bila sisa 0, dua batch apel dan dua batch pisang."
INSERT INTO batch_stok (id_buah, id_stok_masuk, jumlah_masuk_kg, sisa_kg, harga_beli_per_kg, status_batch) VALUES
(1,   1, 14.000,  0.000, 21000, 'Habis'),      -- batch 1: apel, habis -> FIFO berlanjut ke batch 8
(2,   2, 40.000, 37.000, 18000, 'Tersedia'),   -- batch 2
(3,   3, 45.000, 39.500, 15000, 'Tersedia'),   -- batch 3
(4,   4, 35.000, 30.000, 22000, 'Tersedia'),   -- batch 4
(5,   5, 20.000, 18.000, 65000, 'Tersedia'),   -- batch 5
(6,   6, 80.000, 72.500,  5500, 'Tersedia'),   -- batch 6
(7,   7, 30.000, 25.500,  9000, 'Tersedia'),   -- batch 7
(1,   8, 40.000, 36.500, 22000, 'Tersedia'),   -- batch 8
(3,   9, 40.000, 40.000, 15500, 'Tersedia'),   -- batch 9: belum terpakai (batch 3 masih ada)
(9,  10, 25.000, 21.500, 24000, 'Tersedia'),   -- batch 10
(8,  11, 30.000, 25.000,  7500, 'Tersedia'),   -- batch 11
(10, 12, 30.000, 25.500,  6000, 'Tersedia');   -- batch 12

-- ---- transaksi : 6 baris --------------------------------------------
-- QRIS: uang_diterima dan kembalian NULL (sesuai chk_transaksi_pembayaran).
-- total_bruto = jumlah berat x harga; total_diskon = jumlah diskon baris detail.
-- [AI] prompt: "Lengkapi INSERT transaksi 6 baris (Tunai dan QRIS) dengan total_bruto, total_diskon, total_bayar, uang_diterima, dan kembalian yang konsisten dengan CHECK dan dengan detail_transaksi."
INSERT INTO transaksi (id_pengguna, tanggal_waktu, total_bruto, total_diskon, total_bayar, metode_bayar, uang_diterima, kembalian) VALUES
(2, '2026-10-22 09:15:00+07',  95000.00,    0.00,  95000.00, 'Tunai', 100000.00,  5000.00),   -- id 1
(2, '2026-10-22 10:40:00+07', 102000.00, 2000.00, 100000.00, 'QRIS',        NULL,     NULL),   -- id 2
(3, '2026-10-23 08:05:00+07', 106500.00, 1500.00, 105000.00, 'Tunai', 110000.00,  5000.00),   -- id 3
(3, '2026-10-23 16:30:00+07',  95000.00,    0.00,  95000.00, 'QRIS',        NULL,     NULL),   -- id 4
(2, '2026-10-24 11:20:00+07', 384000.00, 4000.00, 380000.00, 'Tunai', 400000.00, 20000.00),   -- id 5
(2, '2026-10-25 09:50:00+07',  54000.00,    0.00,  54000.00, 'QRIS',        NULL,     NULL);   -- id 6

-- ---- detail_transaksi : 11 baris ------------------------------------
-- subtotal = berat_kg x harga_satuan - diskon
-- [AI] prompt: "Lengkapi INSERT detail_transaksi 11 baris dengan berat timbang 3 desimal, harga_satuan, diskon per baris, dan subtotal yang cocok dengan total_bayar tiap transaksi; satu buah hanya sekali per transaksi (uq_detail_transaksi_buah)."
INSERT INTO detail_transaksi (id_transaksi, id_buah, berat_kg, harga_satuan, diskon, subtotal) VALUES
(1, 1,   2.500, 28000,    0.00,  70000.00),   -- id 1  apel
(1, 2,   1.000, 25000,    0.00,  25000.00),   -- id 2  jeruk
(2, 5,   1.200, 85000, 2000.00, 100000.00),   -- id 3  anggur
(3, 3,   3.000, 22000,    0.00,  66000.00),   -- id 4  pisang
(3, 6,   4.500,  9000, 1500.00,  39000.00),   -- id 5  semangka
(4, 4,   2.000, 30000,    0.00,  60000.00),   -- id 6  mangga
(4, 7,   2.500, 14000,    0.00,  35000.00),   -- id 7  melon
(5, 1,  12.000, 28000, 4000.00, 332000.00),   -- id 8  apel (menguras batch 1, lanjut ke batch 8)
(5, 9,   1.500, 32000,    0.00,  48000.00),   -- id 9  alpukat
(6, 10,  3.000, 10000,    0.00,  30000.00),   -- id 10 nanas
(6, 8,   2.000, 12000,    0.00,  24000.00);   -- id 11 pepaya

-- ---- pesanan : 5 baris ----------------------------------------------
-- Pembeli: id_pengguna 4 s.d. 8. total_pesanan = jumlah subtotal detail + biaya_antar.
-- [AI] prompt: "Lengkapi INSERT pesanan 5 baris dengan metode Diantar dan Ambil di Kios, alamat_kirim wajib bila Diantar, biaya_antar 0 bila Ambil di Kios, dan status_pesanan berbeda; status Sedang Diantar hanya untuk Diantar."
INSERT INTO pesanan (id_pengguna, tanggal_pesanan, metode_pengiriman, alamat_kirim, biaya_antar, metode_bayar, status_pesanan, total_pesanan) VALUES
(4, '2026-10-22 19:00:00+07', 'Diantar',       'Jl. Ahmad Yani No. 5, Pasuruan',    10000.00, 'QRIS',  'Selesai',          88000.00),   -- id 1 (78000 + 10000)
(5, '2026-10-23 07:30:00+07', 'Ambil di Kios', NULL,                                    0.00, 'QRIS',  'Selesai',         158000.00),   -- id 2
(6, '2026-10-24 18:10:00+07', 'Diantar',       'Jl. Gajah Mada No. 33, Pasuruan',   10000.00, 'Tunai', 'Sedang Diantar',  120000.00),   -- id 3 (110000 + 10000)
(7, '2026-10-25 08:15:00+07', 'Ambil di Kios', NULL,                                    0.00, 'QRIS',  'Sedang Disiapkan',120000.00),   -- id 4
(8, '2026-10-26 06:45:00+07', 'Diantar',       'Jl. Pahlawan No. 17, Pasuruan',     10000.00, 'Tunai', 'Sedang Disiapkan', 61000.00);   -- id 5 (51000 + 10000)

-- ---- detail_pesanan : 11 baris --------------------------------------
-- [AI] prompt: "Lengkapi INSERT detail_pesanan 11 baris untuk 5 pesanan dengan harga_satuan dan subtotal yang cocok dengan total_pesanan (dikurangi biaya_antar); satu buah hanya sekali per pesanan (uq_detail_pesanan_buah)."
INSERT INTO detail_pesanan (id_pesanan, id_buah, berat_kg, harga_satuan, subtotal) VALUES
(1, 1,  1.000, 28000, 28000.00),   -- id 1  apel
(1, 2,  2.000, 25000, 50000.00),   -- id 2  jeruk
(2, 4,  3.000, 30000, 90000.00),   -- id 3  mangga
(2, 5,  0.800, 85000, 68000.00),   -- id 4  anggur
(3, 7,  2.000, 14000, 28000.00),   -- id 5  melon
(3, 3,  2.500, 22000, 55000.00),   -- id 6  pisang
(3, 6,  3.000,  9000, 27000.00),   -- id 7  semangka
(4, 9,  2.000, 32000, 64000.00),   -- id 8  alpukat
(4, 1,  2.000, 28000, 56000.00),   -- id 9  apel (batch 1 sudah habis -> batch 8)
(5, 8,  3.000, 12000, 36000.00),   -- id 10 pepaya
(5, 10, 1.500, 10000, 15000.00);   -- id 11 nanas

-- ---- stok_keluar_fifo : 23 baris ------------------------------------
-- Satu baris per (batch, detail). Detail yang melewati batas satu batch
-- dipecah menjadi dua baris (detail_transaksi 8: batch 1 dan batch 8).
-- [AI] prompt: "Lengkapi INSERT stok_keluar_fifo 23 baris yang mencatat alokasi FIFO untuk semua detail_transaksi dan detail_pesanan, batch tertua dipakai lebih dulu, dan total per batch sama dengan jumlah_masuk_kg - sisa_kg."
INSERT INTO stok_keluar_fifo (id_batch, id_detail_transaksi, id_detail_pesanan, jumlah_keluar_kg) VALUES
-- dari transaksi kios
(1,   1, NULL,  2.500),
(2,   2, NULL,  1.000),
(5,   3, NULL,  1.200),
(3,   4, NULL,  3.000),
(6,   5, NULL,  4.500),
(4,   6, NULL,  2.000),
(7,   7, NULL,  2.500),
(1,   8, NULL, 10.500),   -- sisa batch 1 dihabiskan
(8,   8, NULL,  1.500),   -- kekurangan diambil dari batch 8
(10,  9, NULL,  1.500),
(12, 10, NULL,  3.000),
(11, 11, NULL,  2.000),
-- dari pesanan online
(1,  NULL, 1,  1.000),
(2,  NULL, 2,  2.000),
(4,  NULL, 3,  3.000),
(5,  NULL, 4,  0.800),
(7,  NULL, 5,  2.000),
(3,  NULL, 6,  2.500),
(6,  NULL, 7,  3.000),
(10, NULL, 8,  2.000),
(8,  NULL, 9,  2.000),
(11, NULL, 10, 3.000),
(12, NULL, 11, 1.500);

-- =====================================================================
-- 4. PEMERIKSAAN CEPAT
-- =====================================================================
-- Jumlah baris per tabel
SELECT 'pengguna' AS tabel, COUNT(*) AS jumlah_baris FROM pengguna
UNION ALL SELECT 'kategori',         COUNT(*) FROM kategori
UNION ALL SELECT 'satuan',           COUNT(*) FROM satuan
UNION ALL SELECT 'buah',             COUNT(*) FROM buah
UNION ALL SELECT 'stok_masuk',       COUNT(*) FROM stok_masuk
UNION ALL SELECT 'batch_stok',       COUNT(*) FROM batch_stok
UNION ALL SELECT 'transaksi',        COUNT(*) FROM transaksi
UNION ALL SELECT 'detail_transaksi', COUNT(*) FROM detail_transaksi
UNION ALL SELECT 'pesanan',          COUNT(*) FROM pesanan
UNION ALL SELECT 'detail_pesanan',   COUNT(*) FROM detail_pesanan
UNION ALL SELECT 'stok_keluar_fifo', COUNT(*) FROM stok_keluar_fifo;
