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