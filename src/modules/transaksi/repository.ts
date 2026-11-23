// [AI] prompt: "Buat src/modules/transaksi/repository.ts untuk semua query SQL modul transaksi kasir memakai library pg dengan parameterized queries ($1, $2, ...), mapping snake_case ke camelCase, dan konversi NUMERIC ke number."

import { Pool, PoolClient } from "pg";
import { pool } from "@/lib/db";
import { Struk, ItemStruk } from "./types";

export interface SimpanTransaksiParams {
  idPengguna: number;
  totalBruto: number;
  totalDiskon: number;
  totalBayar: number;
  metodeBayar: "Tunai" | "QRIS";
  uangDiterima: number | null;
  kembalian: number | null;
}

export interface SimpanDetailTransaksiParams {
  idTransaksi: number;
  idBuah: number;
  beratKg: number;
  hargaSatuan: number;
  diskon: number;
  subtotal: number;
}

export interface RingkasanRiwayat {
  idTransaksi: number;
  tanggalWaktu: string;
  namaKasir: string;
  totalBayar: number;
  metodeBayar: "Tunai" | "QRIS";
  ringkasanItem: string;
}

export interface FilterRiwayatParams {
  idPengguna?: number;
  tanggal?: string; // YYYY-MM-DD (zona Asia/Jakarta)
  limit?: number;
}

// [AI] prompt: "simpanTransaksi: INSERT ke tabel transaksi sesuai DDL 001_skema_awal.sql dan kembalikan idTransaksi serta tanggalWaktu."
export async function simpanTransaksi(
  client: PoolClient,
  params: SimpanTransaksiParams
): Promise<{ idTransaksi: number; tanggalWaktu: string }> {
  const uangDiterima = params.metodeBayar === "QRIS" ? null : params.uangDiterima;
  const kembalian = params.metodeBayar === "QRIS" ? null : params.kembalian;

  const res = await client.query<{
    id_transaksi: number;
    tanggal_waktu: Date;
  }>(
    `INSERT INTO transaksi
       (id_pengguna, total_bruto, total_diskon, total_bayar, metode_bayar, uang_diterima, kembalian)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id_transaksi, tanggal_waktu`,
    [
      params.idPengguna,
      params.totalBruto,
      params.totalDiskon,
      params.totalBayar,
      params.metodeBayar,
      uangDiterima,
      kembalian,
    ]
  );

  const row = res.rows[0];
  return {
    idTransaksi: Number(row.id_transaksi),
    tanggalWaktu: row.tanggal_waktu.toISOString(),
  };
}

// [AI] prompt: "simpanDetailTransaksi: INSERT ke tabel detail_transaksi sesuai DDL 001_skema_awal.sql dan kembalikan idDetailTransaksi."
export async function simpanDetailTransaksi(
  client: PoolClient,
  params: SimpanDetailTransaksiParams
): Promise<{ idDetailTransaksi: number }> {
  const res = await client.query<{ id_detail_transaksi: number }>(
    `INSERT INTO detail_transaksi
       (id_transaksi, id_buah, berat_kg, harga_satuan, diskon, subtotal)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_detail_transaksi`,
    [
      params.idTransaksi,
      params.idBuah,
      params.beratKg,
      params.hargaSatuan,
      params.diskon,
      params.subtotal,
    ]
  );

  return {
    idDetailTransaksi: Number(res.rows[0].id_detail_transaksi),
  };
}

// [AI] prompt: "ambilRiwayat: ambil daftar transaksi terbaru urut DESC dengan filter opsional idPengguna dan tanggal (Asia/Jakarta) beserta ringkasan item belanja."
export async function ambilRiwayat(
  db: Pool | PoolClient = pool,
  filter: FilterRiwayatParams = {}
): Promise<RingkasanRiwayat[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filter.idPengguna !== undefined) {
    values.push(filter.idPengguna);
    conditions.push(`t.id_pengguna = $${values.length}`);
  }

  if (filter.tanggal) {
    values.push(filter.tanggal);
    conditions.push(`DATE(t.tanggal_waktu AT TIME ZONE 'Asia/Jakarta') = $${values.length}::date`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filter.limit && filter.limit > 0 ? Math.min(filter.limit, 100) : 50;
  values.push(limit);

  const res = await db.query<{
    id_transaksi: number;
    tanggal_waktu: Date;
    nama_kasir: string;
    total_bayar: string;
    metode_bayar: "Tunai" | "QRIS";
    ringkasan_item: string | null;
  }>(
    `SELECT
       t.id_transaksi,
       t.tanggal_waktu,
       p.nama AS nama_kasir,
       t.total_bayar,
       t.metode_bayar,
       STRING_AGG(
         b.nama_buah || ' ' || TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM dt.berat_kg::text)) || ' kg',
         ', ' ORDER BY dt.id_detail_transaksi
       ) AS ringkasan_item
     FROM transaksi t
     JOIN pengguna p ON p.id_pengguna = t.id_pengguna
     LEFT JOIN detail_transaksi dt ON dt.id_transaksi = t.id_transaksi
     LEFT JOIN buah b ON b.id_buah = dt.id_buah
     ${whereClause}
     GROUP BY t.id_transaksi, p.nama
     ORDER BY t.tanggal_waktu DESC, t.id_transaksi DESC
     LIMIT $${values.length}`,
    values
  );

  return res.rows.map((row) => ({
    idTransaksi: Number(row.id_transaksi),
    tanggalWaktu: row.tanggal_waktu.toISOString(),
    namaKasir: row.nama_kasir,
    totalBayar: Number(row.total_bayar),
    metodeBayar: row.metode_bayar,
    ringkasanItem: row.ringkasan_item ?? "-",
  }));
}

// [AI] prompt: "ambilStrukById: ambil satu transaksi lengkap dengan nama kasir dan seluruh detail item buah sesuai tipe Struk."
export async function ambilStrukById(
  db: Pool | PoolClient = pool,
  idTransaksi: number
): Promise<Struk | null> {
  const headerRes = await db.query<{
    id_transaksi: number;
    tanggal_waktu: Date;
    nama_kasir: string;
    total_bruto: string;
    total_diskon: string;
    total_bayar: string;
    metode_bayar: "Tunai" | "QRIS";
    uang_diterima: string | null;
    kembalian: string | null;
  }>(
    `SELECT
       t.id_transaksi,
       t.tanggal_waktu,
       p.nama AS nama_kasir,
       t.total_bruto,
       t.total_diskon,
       t.total_bayar,
       t.metode_bayar,
       t.uang_diterima,
       t.kembalian
     FROM transaksi t
     JOIN pengguna p ON p.id_pengguna = t.id_pengguna
     WHERE t.id_transaksi = $1`,
    [idTransaksi]
  );

  if (headerRes.rows.length === 0) {
    return null;
  }

  const h = headerRes.rows[0];

  const detailRes = await db.query<{
    nama_buah: string;
    berat_kg: string;
    harga_satuan: string;
    diskon: string;
    subtotal: string;
  }>(
    `SELECT
       b.nama_buah,
       dt.berat_kg,
       dt.harga_satuan,
       dt.diskon,
       dt.subtotal
     FROM detail_transaksi dt
     JOIN buah b ON b.id_buah = dt.id_buah
     WHERE dt.id_transaksi = $1
     ORDER BY dt.id_detail_transaksi ASC`,
    [idTransaksi]
  );

  const item: ItemStruk[] = detailRes.rows.map((d) => ({
    namaBuah: d.nama_buah,
    beratKg: Number(d.berat_kg),
    hargaSatuan: Number(d.harga_satuan),
    diskon: Number(d.diskon),
    subtotal: Number(d.subtotal),
  }));

  return {
    idTransaksi: Number(h.id_transaksi),
    tanggalWaktu: h.tanggal_waktu.toISOString(),
    namaKasir: h.nama_kasir,
    item,
    totalBruto: Number(h.total_bruto),
    totalDiskon: Number(h.total_diskon),
    totalBayar: Number(h.total_bayar),
    metodeBayar: h.metode_bayar,
    uangDiterima: h.uang_diterima !== null ? Number(h.uang_diterima) : null,
    kembalian: h.kembalian !== null ? Number(h.kembalian) : null,
  };
}
